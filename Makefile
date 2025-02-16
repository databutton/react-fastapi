install:
	cd apis && ./install.sh
	cd ui && ./install.sh

start-api:
	cd apis && uvicorn main:app --reload

start-ui:
	cd ui && npm run dev