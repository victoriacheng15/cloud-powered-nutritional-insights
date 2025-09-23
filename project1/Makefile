.PONY: build run single multi

build:
	docker build -t diet-analysis .

run:
	docker run -it diet-analysis

single:
	docker build -t single-diet-analysis .

multi:
	docker build -t multi-diet-analysis -f Dockerfile.multi-stage .