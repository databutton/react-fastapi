from fastapi import FastAPI
import os
import importlib

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
                app.include_router(router_module.router)


register_routers()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
