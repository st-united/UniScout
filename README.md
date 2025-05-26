<p align="center">
  <a href="https://prettier.io/" target="blank"><img src="https://prettier.io/icon.png" height="100" alt="Prettier logo" /></a>
  <a href="https://eslint.org/" target="blank"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/ESLint_logo.svg/648px-ESLint_logo.svg.png?20211012234406" height="100" alt="ESLint logo" /></a>
  <a href="https://docs.docker.com/" target="blank"><img src="https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png" height="60" alt="Docker logo" /></a>
</p>

# AICP - Frontend

## Table of contents

- [AICP - Frontend](#AICP---frontend)
  - [Table of contents](#table-of-contents)
  - [Getting started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [What's in the box ?](#whats-in-the-box-)
    - [Commitlint](#commitlint)
    - [Docker Compose](#docker-compose)
    - [ESLint](#eslint)
    - [Husky](#husky)
    - [Lint-staged](#lint-staged)
    - [Prettier](#prettier)
  - [Useful Docker commands](#useful-docker-commands)

---

## Getting started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

What things you need to install the software and how to install them :

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/)
- [Docker](https://docs.docker.com/docker-for-windows/install/) or [Docker Toolbox](https://github.com/docker/toolbox/releases)

---

### Installation

1. Clone the git repository

1. Go into the project directory

1. Checkout working branch

   ```bash
   git checkout <branch>
   ```

1. Install NPM dependencies

   ```bash
   npm i
   ```

1. Copy `.env.example` to `.env`

   ```bash
   cp .env.example .env
   ```

1. Replace the values of the variables with your own

1. Create Docker images and launch them

   ```bash
   docker-compose up -d --build
   ```

---

## What's in the box ?

### Commitlint

[commitlint](https://github.com/conventional-changelog/commitlint) checks if your commit messages meet the [conventional commit format](https://conventionalcommits.org).

**Configuration file**: [`.commitlintrc.json`](./.commitlintrc.json).

In general the pattern mostly looks like this:

```sh
type(scope?): subject  #scope is optional
```

---

### Docker Compose

**Compose file**: [`docker-compose.yml`](./docker-compose.yml).

Containers :

- Node 16
- PostgreSQL 14

Compose file uses `.env`.

---

### ESLint

[ESLint](https://eslint.org/) is a fully pluggable tool for identifying and reporting on patterns in JavaScript.

**Configuration file**: [`.eslintrc.js`](./.eslintrc.js).

For more configuration options and details, see the [configuration docs](https://eslint.org/docs/user-guide/configuring).

---

### Husky

[Husky](https://github.com/typicode/husky) is a package that helps you create Git hooks easily.

**Configuration folder**: [`.husky`](./.husky/).

---

### Lint-staged

[Lint-staged](https://github.com/okonet/lint-staged) is a Node.js script that allows you to run arbitrary scripts against currently staged files.

**Configuration file**: [`.lintstagedrc.json`](./.lintstagedrc.json).

---

### Prettier

[Prettier](https://prettier.io/) is an opinionated code formatter.

**Configuration file**: [`.prettierrc.json`](./.prettierrc.json).  
**Ignore file**: [`.prettierignore`](./.prettierignore).

For more configuration options and details, see the [configuration docs](https://prettier.io/docs/en/configuration.html).

---

## Useful Docker commands

1. If you want to check that all containers are up :

   ```bash
   docker-compose ps
   ```

1. Other Docker commands :

   ```bash
   # Start Docker
   docker-compose start

   # Restart Docker
   docker-compose restart

   # Stop Docker
   docker-compose stop

   # Delete all containers
   docker rm $(docker ps -aq)

   # Delete all images
   docker rmi $(docker images -q)

   # Remove all volumnes
   docker volume prune
   ```

1. How to get a Docker container's IP address from the host ?

   ```bash
   docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <container>
   docker inspect $(docker ps -f name=<service> -q) | grep IPAddress
   ```

---

## Deploy

### Step

1. SSH to server

2. Install node npm

   ```bash
   curl -sL https://deb.nodesource.com/setup_16.x -o /tmp/nodesource_setup.sh

   nano /tmp/nodesource_setup.sh

   sudo bash /tmp/nodesource_setup.sh

   sudo apt install nodejs
   ```

3. Install nest cli
   ```bash
   sudo npm i -g @nestjs/cli
   ```
4. Clone source

5. Install docker and docker compose

   a. Install docker

   ```bash
   sudo apt update

   sudo apt install apt-transport-https ca-certificates curl software-properties-common

   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
   sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"

   sudo apt install docker-ce
   ```

   b. Install docker-compose

   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

   sudo chmod +x /usr/local/bin/docker-compose
   ```

6. Make Caddyfile in root folder:

   ```bash
   touch Caddyfile
   ```

   ```bash
   your_domain_frontend {
      reverse_proxy   frontend:5001
   }

   your_domain_backend {
      reverse_proxy   backend:6002
   }
   ```

7. Make docker-compose.yml in root folder:

   ```bash
   touch docker-compose.yml
   ```

   ```bash
   version: "3.8"
   services:
     frontend:
       container_name: AICP
       build:
         context: ./AICP
         dockerfile: ./docker/prod.Dockerfile
       pull_policy: always
       env_file:
         - ./AICP/.env.production
       ports:
         - 5001:5001
       networks:
         - aicp

     backend:
       container_name: AICP-be
       build:
         context: ./AICP
         dockerfile: ./docker/Dockerfile.product
       pull_policy: always
       env_file:
         - ./AICP/.env.production
       ports:
         - 6002:6002
       command: npm run start:prod
       depends_on:
         - db
       networks:
         - aicp
       restart: unless-stopped

     db:
       image: postgres:14.4-alpine
       container_name: AICP
       environment:
         POSTGRES_DB: AICP
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: password
       ports:
         - 5432:5432
       env_file:
         - ./AICP/.env.production
       volumes:
         - AICP-data:/var/lib/postgresql/data
       restart: unless-stopped
       networks:
         - aicp

     caddy-proxy:
       image: caddy:2.4.3-alpine
       restart: unless-stopped
       ports:
         - 80:80
         - 443:443
       volumes:
         - ./Caddyfile:/etc/caddy/Caddyfile
       depends_on:
         - frontend
         - backend
       networks:
         - aicp

   volumes:
     caddy:
     AICP-data:

   networks:
     aicp:
       driver: bridge
   ```

8. docker-compose up
