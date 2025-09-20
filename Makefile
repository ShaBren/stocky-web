docker-image:
	docker buildx build --platform linux/amd64,linux/arm64 -t docker-registry.eruditio.net/stocky-web:latest --push .
