# Simple CRUD API

## Description

This is a simple CRUD (Create, Read, Update, Delete) API built with TypeScript. It serves as a basic template for building RESTful APIs and demonstrates the use of various technologies such as TypeScript, Jest for testing, ESLint for linting, and Prettier for code formatting.

## Features

- Create, Read, Update, and Delete operations
- TypeScript for type safety
- Jest for unit testing
- ESLint for code quality
- Prettier for code formatting
- Environment variable management with dotenv

## Getting Started

### Prerequisites

- Node.js (version 22.14.0 or higher)
- npm (Node package manager)

### Installation

1. Clone the repository:

```
git clone https://github.com/nos64/simple-crud-api.git

cd simple-crud-api
```

2. Install the dependencies:

```
npm install
```

### Running the Application

#### For development:

```
npm run start:dev
```

#### For production:

```
npm run start:build
```

```
npm run build
```

### Running Tests

```
npm test
```

### Code Quality

#### To lint the code, run:

```
npm run lint
```

#### To format the code, run:

```
npm run format
```

### Implemented endpoint api/users:

```
npm run start:dev
```

or

```
npm run start:prod
```

#### GET api/users is used to get all persons

```
curl -X GET http://localhost:4000/api/users
```

#### GET api/users/{userId}

```
curl -X GET http://localhost:4000/api/users/{:id}
```

#### POST api/users is used to create record about new user and store it in database

```
curl -X POST http://localhost:4000/api/users -d '{"username": "test", "age": 25, "hobbies": []}'
```

#### PUT api/users/{userId} is used to update existing user

```
curl -X PUT http://localhost:4000/api/{:id} -d '{"username": "test2"}'
```

#### DELETE api/users/{userId} is used to delete existing user from database

```
curl -X DELETE http://localhost:4000/api/{:id}
```
