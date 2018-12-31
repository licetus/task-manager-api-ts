import {
  Swagger20Request as Request,
  SwaggerRequestParameters,
  SwaggerRequestParameter
} from 'swagger-tools'
import { Response } from 'express'
import { Model } from 'task-manager-model-ts'
import { logger } from '../global'

interface P extends SwaggerRequestParameters {
  taskId: SwaggerRequestParameter<number>
  body: SwaggerRequestParameter<{ [key: string]: any }>
  query: SwaggerRequestParameter<{ [key: string]: any }>
}

export const addTask = async (req: Request<P>, res: Response) => {
  const data = req.swagger.params.body.value
  logger.trace('Add new task', data)
  const object = await new Model.Task(data).save()
  return res.json(object)
}

export const getTaskList = async (req: Request<P>, res: Response) => {
  const params = req.swagger.params.query
  const t = new Model.Task()
  logger.trace('Get task list', params)
  const items = await t.getList(params)
  const total = await t.getListCount(params)
  return res.json({
    total,
    items,
  })
}

export const getTask = async (req: Request<P>, res: Response) => {
  const id = req.swagger.params.taskId.value
  logger.trace('Get task', id)
  const object = await new Model.Task().get(id)
  return res.json(object)
}

export const updateTask = async (req: Request<P>, res: Response) => {
  const id = req.swagger.params.taskId.value
  const data = req.swagger.params.body.value
  data['id'] = id
  logger.trace('Update task', data)
  await new Model.Task(data).save()
  return res.sendStatus(200)
}

export const deleteTask = async (req: Request<P>, res: Response) => {
  const id = req.swagger.params.taskId.value
  logger.trace('Delete task', id)
  await new Model.Task().delete(id)
  return res.sendStatus(200)
}
