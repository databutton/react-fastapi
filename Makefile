install-apis:
	chmod +x apis/install.sh
	chmod +x apis/run.sh
	cd apis && ./install.sh

install-ui:
	chmod +x ui/install.sh
	chmod +x ui/run.sh
	cd ui && ./install.sh

install: install-apis install-ui
