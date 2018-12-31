import {
  Swagger20Request as SReq,
  SwaggerRequestParameters,
  SwaggerRequestParameter
} from 'swagger-tools'
import { Request, Response } from 'express'
import { Model, errors } from 'task-manager-model-ts'
import { logger } from '../../global'

interface P extends SwaggerRequestParameters {
  id: SwaggerRequestParameter<number>
}

export const addTask = async (req: Request, res: Response) => {
  const data = req.body
  logger.trace('Add new task', data)
  const object = await new Model.Task(data).save()
  return res.json(object.props.id)
}

export const getTaskList = async (req: Request, res: Response) => {
  const params = req.query
  const t = new Model.Task()
  logger.trace('Get task list', params)
  const items = await t.getList(params)
  const total = await t.getListCount(params)
  return res.json({
    total,
    items,
  })
}

export const getTask = async (req: Request, res: Response) => {
  const id = req.params.id.value
  logger.trace('Get task', id)
  const object = await new Model.Task().get(id)
  return res.json(object)
}

export const updateTask = async (req: Request, res: Response) => {
  const id = req.params.id.value
  const data = req.body
  data['id'] = id
  logger.trace('Update task', data)
  await new Model.Task(data).save()
  return res.sendStatus(200)
}

export const deleteTask = async (req: Request, res: Response) => {
  const id = req.params.id.value
  logger.trace('Delete task', id)
  await new Model.Task().delete(id)
  return res.sendStatus(200)
}
