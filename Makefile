install-apis:
	chmod +x apis/install.sh
	cd apis && ./install.sh

install-ui:
	chmod +x ui/install.sh
	cd ui && ./install.sh

install: install-apis install-ui
