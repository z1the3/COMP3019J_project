from flask import Flask
from route.reservation_route import create_reservation_router
from exts import db
from route.user_route import create_user_router

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:123456@localhost:3306/appointment'
db.init_app(app)
user_bp = create_user_router()
reservation_bp = create_reservation_router()
app.register_blueprint(user_bp)
app.register_blueprint(reservation_bp)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
