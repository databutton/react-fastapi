from fastapi import Depends, FastAPI, params
import os
import importlib
import dotenv
import json

from auth_mw import get_authorized_user

dotenv.load_dotenv()

app = FastAPI()


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


def register_routers():
    routes_dir = "routes"
    for root, dirs, files in os.walk(routes_dir):
        if "__init__.py" in files:
            relative_path = os.path.relpath(root, ".")
            module_path = relative_path.replace(os.path.sep, ".")
            router_module = importlib.import_module(module_path)
            if hasattr(router_module, "router"):
                router_name = module_path.split(".")[-1]
                with open("routers.json") as f:
                    router_config = json.load(f)
                    disable_auth = (
                        router_config["routers"]
                        .get(router_name, {})
                        .get("disableAuth", False)
                    )

                auth_dependencies: list[params.Depends] = (
                    [] if disable_auth else [Depends(get_authorized_user)]
                )

                app.include_router(
                    router_module.router,
                    prefix="/routes",
                    dependencies=auth_dependencies,
                )

    # Print all registered routes
    print("\nRegistered routes:")
    for route in app.routes:
        print(f"{route.methods} {route.path}")


register_routers()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
