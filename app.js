const express = require('express')
const app = express()
app.use(express.json())
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const path = require('path')
const dbpath = path.join(__dirname, 'todoApplication.db')
const {format} = require('date-fns')
let db = null

const dbinitilizer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server is running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`database connection error is ${e.message}`)
    process.exit(1)
  }
}
dbinitilizer()

app.get('/todos/', async (request, response) => {
  const {
    priority = '',
    status = '',
    category = '',
    search_q = '',
  } = request.query
  let v = true

  if (priority.length !== 0) {
    if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
      response.status(200)
    } else {
      v = false
      response.status(400)
      response.send('Invalid Todo Priority')
    }
  } else {
    response.status(200)
  }

  if (status.length !== 0) {
    if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
      response.status(200)
    } else {
      v = false
      response.status(400)
      response.send('Invalid Todo Status')
    }
  } else {
    response.status(200)
  }

  if (category.length !== 0) {
    if (category === 'WORK' || category === 'HOME' || category === 'LEARNING') {
      response.status(200)
    } else {
      v = false
      response.status(400)
      response.send('Invalid Todo Category')
    }
  } else {
    response.status(200)
  }
  const query = `select * from todo where todo like '%${search_q}%' and
category like '%${category}%' and
priority like '%${priority}%' and status like '%${status}%'`
  const result = await db.all(query)
  const r1 = result.map(e => {
    return {
      id: e.id,
      todo: e.todo,
      priority: e.priority,
      status: e.status,
      category: e.category,
      dueDate: e.due_date,
    }
  })
  if (v) {
    response.status(200)
    response.send(r1)
  }
})

//api2
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const query = `select * from todo where id=${todoId}`
  const result = await db.get(query)
  response.send({
    id: result.id,
    todo: result.todo,
    priority: result.priority,
    status: result.status,
    category: result.category,
    dueDate: result.due_date,
  })
})

//api3
app.get('/agenda/', async (request, response) => {
  const {date} = request.query

  try {
    const dateformat = format(new Date(date), 'yyyy-MM-dd')
    const query = `select * from todo where due_date like '${dateformat}'`
    const result = await db.all(query)
    const r1 = result.map(e => {
      return {
        id: e.id,
        todo: e.todo,
        priority: e.priority,
        status: e.status,
        category: e.category,
        dueDate: e.due_date,
      }
    })
    response.status(200)
    response.send(r1)
  } catch (e) {
    console.log(`error in date is ${e.message}`)
    response.status(400)
    response.send('Invalid Due Date')
  }

  console.log(date)
})

// api4
app.post('/todos/', async (request, response) => {
  const {
    id,
    todo,
    priority = '',
    status = '',
    category = '',
    dueDate,
  } = request.body
  let v = true

  if (priority.length !== 0) {
    if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
      response.status(200)
    } else {
      v = false
      return response.status(400).send('Invalid Todo Priority')
    }
  }

  if (status.length !== 0) {
    if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
      response.status(200)
    } else {
      v = false
      return response.status(400).send('Invalid Todo Status')
    }
  }
  if (category.length !== 0) {
    if (category === 'WORK' || category === 'HOME' || category === 'LEARNING') {
      response.status(200)
    } else {
      v = false
      return response.status(400).send('Invalid Todo Category')
    }
  }
  try {
    const dateformat = format(new Date(dueDate), 'yyyy-MM-dd')
    const query = `insert into todo values('${id}','${todo}','${priority}','${status}','${category}','${dateformat}')`
    const result = await db.run(query)
    response.status(200)
    response.send('Todo Successfully Added')
  } catch (e) {
    console.log(`error occur at ${e.message}`)
    response.status(400)
    response.send('Invalid Due Date')
  }
})

//api5
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const {
    todo,
    status = '',
    priority = '',
    category = '',
    dueDate,
  } = request.body
  let c
  let d
  let e

  if (priority.length !== 0) {
    if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
      c = 'priority'
      d = priority
      e = 'Priority'
      response.status(200)
    } else {
      return response.status(400).send('Invalid Todo Priority')
    }
  } else {
    response.status(200)
  }

  if (status.length !== 0) {
    if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
      c = 'status'
      e = 'Status'
      d = status
      response.status(200)
    } else {
      return response.status(400).send('Invalid Todo Status')
    }
  } else {
    response.status(200)
  }

  if (category.length !== 0) {
    if (category === 'WORK' || category === 'HOME' || category === 'LEARNING') {
      c = 'category'
      d = category
      e = 'Category'
      response.status(200)
    } else {
      return response.status(400).send('Invalid Todo Category')
    }
  } else {
    response.status(200)
  }
  try {
    if (todo !== undefined) {
      e = 'Todo'
      c = 'todo'
      d = todo
    }
    if (dueDate !== undefined) {
      const dateformat = format(new Date(dueDate), 'yyyy-MM-dd')
      c = 'due_date'
      d = dateformat
      e = 'Due Date'
    }

    const query = `update todo set '${c}'='${d}' where id=${todoId}`
    const result = await db.run(query)

    response.status(200)
    response.send(`${e} Updated`)
  } catch (er) {
    console.log(`error occur at ${er.message}`)
    response.status(400)
    response.send('Invalid Due Date')
  }
})

// api6
app.delete('/todos/:todoId/', async (request, response) => {
  // response.send()
  const {todoId} = request.params
  const query = `delete from todo where id=${todoId}`
  const result = await db.run(query)
  response.status(200)
  response.send('Todo Deleted')
})

module.exports = app
