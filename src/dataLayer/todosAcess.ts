import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

function createDynamoDBClient() {
    return new XAWS.DynamoDB.DocumentClient()
}

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todoTable = process.env.TODOS_TABLE,
        private readonly attachmentBucket = process.env.ATTACHMENT_S3_BUCKET) 
    {
    }

    async getTodo(userId: string, todoId: string): Promise<TodoItem> {
        const result = await this.docClient.get({
            TableName: this.todoTable,
            Key: { userId, todoId }
        })
            .promise()

        return result.Item as TodoItem
    }

    async getAllTodos(userId: string): Promise<TodoItem[]> {

        const result = await this.docClient.query({
            TableName: this.todoTable,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId
            },

        }).promise()

        const items = result.Items as TodoItem[]
        return items
    }

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todoTable,
            Item: todoItem
        }).promise()

        return todoItem;
    }

    async deleteTodo(userId: string, todoId: string): Promise<void> {
        await this.docClient.delete({
            TableName: this.todoTable,
            Key: { userId, todoId }
        }).promise()
    }

    async updateTodo(userId: string, todoId: string, todoUpdate: UpdateTodoRequest): Promise<void> {
        logger.info('Update todo: ', todoUpdate)
        await this.docClient.update({
            TableName: this.todoTable,
            Key: { todoId, userId },
            UpdateExpression: 'set #name = :updateName, #done = :updateDone, #dueDate = :updateDueDate',
            ExpressionAttributeNames: { '#name': 'name', '#done': 'done', '#dueDate': 'dueDate' },
            ExpressionAttributeValues: {
                ':updateName': todoUpdate.name,
                ':updateDone': todoUpdate.done,
                ':updateDueDate': todoUpdate.dueDate,
            },
            ReturnValues: "UPDATED_NEW"
        }).promise();
    }

    async updateAttachment(userId: string, todoId: string): Promise<void> {
        await this.docClient.update({
            TableName: this.todoTable,
            Key: { userId, todoId  },
            UpdateExpression: 'set #attachmentUrl = :attachmentUrl',
            ExpressionAttributeNames: { '#attachmentUrl': 'attachmentUrl' },
            ExpressionAttributeValues: {
              ':attachmentUrl': `https://${this.attachmentBucket}.s3.amazonaws.com/${todoId}`
            },
            ReturnValues: "UPDATED_NEW"
          }).promise();
      }
}