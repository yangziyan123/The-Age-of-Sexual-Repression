from flask import Flask

from config import Config


def create_app(config_class: type[Config] = Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_class)

    from app.routes.main import main_bp
    from app.routes.quote import quote_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(quote_bp)

    return app

