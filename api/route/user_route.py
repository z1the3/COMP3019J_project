import logging
import os

from flask import Blueprint, current_app
from exts import db
from flask import request, jsonify
from model.registration import Registration, RegistrationDate
from model.reservation import Reservation, ReservationDate
from model.user import User  # 导入模型
from werkzeug.security import generate_password_hash, check_password_hash


def create_user_router():
    user_bp = Blueprint('user_bp', __name__)

    # 获取配置过的日志记录器
    logger = logging.getLogger('myapp')

    @user_bp.route('/user/login', methods=['POST'])
    def post_user_login():
        try:
            data = request.get_json()
            userId = data.get('userId')
            password = data.get('password')  # 从请求中获取的明文密码
            auth = data.get('auth')

            # 在数据库中查找用户
            user = User.query.filter_by(userId=userId).first()

            if user:
                # 检查用户是否被禁用
                if user.state == 0:
                    logger.warning(f"Login attempt for banned user: {userId}")
                    return jsonify({'message': 'User is banned'}), 403  # 禁止

                # 验证密码和用户类型
                if check_password_hash(user.password, password) and user.auth == int(auth):
                    user_data = {
                        'userId': user.userId,
                        'name': user.name,
                        'auth': user.auth
                    }
                    logger.info(f"User {userId} logged in successfully.")
                    return jsonify(user_data), 200  # 返回JSON响应，HTTP状态码200（OK）
                else:
                    logger.warning(f"Invalid login attempt for user: {userId}")
                    return jsonify({'message': 'Invalid password or auth'}), 401  # 未授权

            else:
                logger.warning(f"Login attempt for non-existent user: {userId}")
                return jsonify({'message': 'User not found'}), 404  # 未找到

        except Exception as e:
            # 处理异常，并记录错误日志
            logger.error(f"Error in user login: {e}")
            return jsonify({'code': 1, 'message': str(e)}), 500  # 返回错误响应

    @user_bp.route('/user/register', methods=['POST'])
    def post_user_register():
        try:
            data = request.get_json()
            userId = data.get('userId')
            password = data.get('password')  # 从请求中获取的明文密码
            name = data.get('name')
            auth = data.get('auth')

            # 检查用户是否已存在
            existing_user = User.query.filter_by(userId=userId).first()

            if existing_user:
                logger.warning(f"Attempt to register already existing user: {userId}")
                return jsonify({'message': 'User already exists'}), 400

            # 在存储之前对密码进行哈希处理
            hashed_password = generate_password_hash(password)

            # 使用哈希密码创建新用户
            new_user = User(userId=userId, password=hashed_password, name=name, auth=auth)
            db.session.add(new_user)
            db.session.commit()

            user_data = {
                'userId': new_user.userId,
                'name': new_user.name,
                'auth': new_user.auth
            }
            logger.info(f"User {userId} registered successfully.")
            return jsonify(user_data), 201  # 返回JSON响应，HTTP状态码201（已创建）

        except Exception as e:
            # 处理异常，并记录错误日志
            logger.error(f"Error in user registration: {e}")
            return jsonify({'code': 1, 'message': str(e)}), 500  # 返回错误响应

    # 删除用户及其相关的所有记录
    @user_bp.route('/user/delete', methods=['DELETE'])
    def delete_account():
        try:
            data = request.get_json()
            user_id = data['userId']

            # 删除与用户相关的所有 registration 记录
            registrations = Registration.query.filter_by(userId=user_id).all()
            for reg in registrations:
                RegistrationDate.query.filter_by(registration_id=reg.id).delete()
                db.session.delete(reg)

            db.session.commit()

            # 删除与用户相关的所有 reservation 记录
            reservations = Reservation.query.filter_by(userId=user_id).all()
            for res in reservations:
                # 首先删除所有相关的 registration 记录
                Registration.query.filter_by(reservation_id=res.id).delete()

                # 接着删除所有相关的 reservation_date 记录
                ReservationDate.query.filter_by(reservation_id=res.id).delete()

                # 最后删除 reservation 记录本身
                db.session.delete(res)

            # 删除用户账户
            User.query.filter_by(userId=user_id).delete()

            # 提交更改
            db.session.commit()

            logger.info(f"User account and related records deleted for user {user_id}.")
            return jsonify({'code': 0})  # 0 表示成功

        except Exception as e:
            # 发生异常，回滚事务
            db.session.rollback()
            logger.error(f"Error in deleting user account: {e}")
            return jsonify({'code': 1, 'message': str(e)})  # 1 表示失败

    # 获取所有用户信息（不包括管理员）
    @user_bp.route('/user/all', methods=['GET'])
    def get_all_user_infos():
        try:
            # 查询 auth 为 0 的用户
            users = User.query.filter_by(auth=0).all()

            user_infos = []
            for user in users:
                user_info = {
                    'userId': user.userId,
                    'name': user.name,
                    'state': get_state_description(user.state)
                }
                user_infos.append(user_info)

            logger.info("Successfully retrieved all non-admin user information.")
            return jsonify({'code': 0, 'users': user_infos})

        except Exception as e:
            logger.error(f"Error in retrieving all non-admin user information: {e}")
            return jsonify({'code': 1, 'message': str(e)}), 500
        
    def get_state_description(state):
    # 根据 state 的值定义真实状态描述
        if state == 1:
            return "Normal"
        elif state == 0:
            return "Ban"
        # 可以根据需要添加更多的状态描述
        else:
            return "Unknown"

    # 编辑用户（名称, 状态）
    @user_bp.route('/user/edit', methods=['POST'])
    def post_modify_user():
        try:
            data = request.get_json()
            user_id = data['userId']
            new_name = data['name']
            new_state = data['state']

            # 查找用户
            user = User.query.filter_by(userId=user_id).first()
            converted_state = 1 if new_state == 'Normal' else 0

            if user:
                # 更新用户信息
                user.name = new_name
                user.state = converted_state
                db.session.commit()
                logger.info(f"User {user_id} information updated successfully.")
                return jsonify({'code': 0})  # 0 表示成功

            logger.warning(f"Attempt to edit non-existent user: {user_id}")
            return jsonify({'code': 1, 'message': 'User not found'})  # 1 表示失败，用户未找到

        except Exception as e:
            # 处理异常，并记录错误日志
            logger.error(f"Error in editing user information: {e}")
            return jsonify({'code': 1, 'message': str(e)}), 500  # 返回错误响应

    @user_bp.route('/log', methods=['GET'])
    def get_logs():
        try:
            # 计算 logs 文件夹的绝对路径
            logs_dir = os.path.join(os.path.dirname(os.getcwd()), 'log')
            log_file_path = os.path.join(logs_dir, 'app.log')

            # 读取日志文件的内容
            with open(log_file_path, 'r') as file:
                log_content = file.read()

            # 返回包含日志文件内容的 JSON 对象
            return jsonify({'log': log_content})
        except Exception as e:
            # 如果出现异常，返回错误信息
            return jsonify({'error': str(e)}), 500

    return user_bp
