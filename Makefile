.PHONY: image test release

IMAGE_NAME ?= codeclimate/codeclimate-fixme
RELEASE_REGISTRY ?= codeclimate
RELEASE_TAG ?= latest

image:
	docker build --rm -t $(IMAGE_NAME) .

test: image
	docker run --rm -v $$PWD/test/fixtures:/code $(IMAGE_NAME) sh -c "cd /usr/src/app && npm test"

release:
	docker tag $(IMAGE_NAME) $(RELEASE_REGISTRY)/codeclimate-fixme:$(RELEASE_TAG)
	docker push $(RELEASE_REGISTRY)/codeclimate-fixme:$(RELEASE_TAG)
