
.PHONY: clean
clean:
	rm -Rf test/*.pyc
	find api -name '*.pyc' -delete

.PHONY: env
env:
	virtualenv env
	./env/bin/pip install -r requirements.txt
