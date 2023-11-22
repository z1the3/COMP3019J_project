from flask import Flask
from config import Config
from route.reservation_route import create_reservation_router
from exts import db
from route.user_route import create_user_router
import logging
from logging.handlers import RotatingFileHandler
import os

# 配置日志
def configure_logging():
    # 创建日志文件路径
    log_directory = os.path.join(os.getcwd(), 'logs')
    if not os.path.exists(log_directory):
        os.makedirs(log_directory)
    log_file_path = os.path.join(log_directory, 'app.log')

    # 创建日志记录器
    logger = logging.getLogger('myapp')
    logger.setLevel(logging.INFO)

    # 创建文件处理器和格式器
    file_handler = RotatingFileHandler(log_file_path, maxBytes=10240, backupCount=10)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(name)s: %(message)s')
    file_handler.setFormatter(formatter)

    # 添加处理器到记录器
    logger.addHandler(file_handler)

# 调用日志配置函数
configure_logging()

# Create a Flask application instance
app = Flask(__name__)

# 应用配置
app.config.from_object(Config)
# 设置数据库连接
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:liunb0905@localhost:3306/appointment'
db.init_app(app)

# 创建蓝图
user_bp = create_user_router()
reservation_bp = create_reservation_router()

# 注册蓝图
app.register_blueprint(user_bp)
app.register_blueprint(reservation_bp)

# 运行Flask应用
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

