import logging

from flask import Blueprint
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

            # 删除与用户相关的所有 registration_date 和 registration 记录
            registrations = Registration.query.filter_by(userId=user_id).all()
            for reg in registrations:
                RegistrationDate.query.filter_by(registration_id=reg.id).delete()
                db.session.delete(reg)

            # 删除与用户相关的所有 reservation_date 和 reservation 记录
            reservations = Reservation.query.filter_by(userId=user_id).all()
            for res in reservations:
                ReservationDate.query.filter_by(reservation_id=res.id).delete()
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
                    'state': user.state
                }
                user_infos.append(user_info)

            logger.info("Successfully retrieved all non-admin user information.")
            return jsonify({'code': 0, 'users': user_infos})

        except Exception as e:
            logger.error(f"Error in retrieving all non-admin user information: {e}")
            return jsonify({'code': 1, 'message': str(e)}), 500

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

            if user:
                # 更新用户信息
                user.name = new_name
                user.state = new_state
                db.session.commit()
                logger.info(f"User {user_id} information updated successfully.")
                return jsonify({'code': 0})  # 0 表示成功

            logger.warning(f"Attempt to edit non-existent user: {user_id}")
            return jsonify({'code': 1, 'message': 'User not found'})  # 1 表示失败，用户未找到

        except Exception as e:
            # 处理异常，并记录错误日志
            logger.error(f"Error in editing user information: {e}")
            return jsonify({'code': 1, 'message': str(e)}), 500  # 返回错误响应

    return user_bp
