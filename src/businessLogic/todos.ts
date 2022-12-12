import { TodosAccess } from '../dataLayer/todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { addAttachment, deleteAttachment } from '../helpers/attachmentUtils'
import * as uuid from 'uuid'
import { createLogger } from '../utils/logger'

const logger = createLogger('todos');

const todoAccess = new TodosAccess()

export async function getTodos(userId: string): Promise<TodoItem[]> {
  const items = await todoAccess.getAllTodos(userId)

  // for (let item of items) {
  //   if (!!item['attachmentUrl'])
  //     item['attachmentUrl'] = getDownloadUrl(item['attachmentUrl'])
  // }

  return items
}

export async function getTodo(userId: string, todoId: string): Promise<TodoItem> {
  return todoAccess.getTodo(userId, todoId)
}

export async function updateTodo(userId: string, id: string, payload: UpdateTodoRequest) : Promise<void>{
  return todoAccess.updateTodo(userId, id, payload)
}

export async function deleteTodo(userId: string, id: string): Promise<void> {
  await deleteAttachment(id)
  return todoAccess.deleteTodo(userId, id)
}

export async function createAttachmentPresignedUrl(userId: string, todoId: string): Promise<string> {
  const uploadUrl = addAttachment(todoId)
  await todoAccess.updateAttachment(userId, todoId)

  logger.info('uploadUrl')
  logger.info(uploadUrl)

  return uploadUrl
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const todoId = uuid.v4()

  return await todoAccess.createTodo({
    userId,
    todoId,
    name: createTodoRequest.name,
    done: false,
    createdAt: new Date().toISOString(),
    dueDate: createTodoRequest.dueDate
  })
}