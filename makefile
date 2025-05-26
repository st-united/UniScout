AICP_ADMIN_DEV_REPO:= 902637028063.dkr.ecr.ap-southeast-1.amazonaws.com/aicp-admin:0.0.21

up:
	docker-compose up -d

down:
	docker-compose down

exec:
	docker-compose exec frontend sh

format:
	docker-compose exec frontend npm run lint

test:
	docker-compose exec frontend npm run test

test-coverage:
	docker-compose exec frontend npm run test:coverage

build:
	docker build \
		--platform linux/x86_64 \
		-f docker/prod.Dockerfile \
		-t $(AICP_ADMIN_DEV_REPO) \
		--no-cache=true \
		.; \
		docker push $(AICP_ADMIN_DEV_REPO);

login:
	aws ecr get-login-password \
    --region ap-southeast-1 \
	| docker login \
    --username AWS \
    --password-stdin 902637028063.dkr.ecr.ap-southeast-1.amazonaws.com


run:
	docker run \
		--detach \
		--name aicp-admin-test \
		--env-file .env \
		-p 5001:5001 \
		aicp:latest
