from flask import Blueprint
from exts import db
from flask import request, jsonify, current_app # 导入 current_app
from model.registration import Registration, RegistrationDate
from model.reservation import Reservation, ReservationDate
from model.user import User  # 导入模型


def create_user_router():
    user_bp = Blueprint('user_bp', __name__)
    @user_bp.route('/index', methods=['GET'])
    def index():
        return 'Index'

    @user_bp.route('/user/login', methods=['POST'])
    def post_user_login():
        # Use current_app to get the application instance
        app = current_app._get_current_object()
        data = request.get_json()
        userId = data.get('userId')
        password = data.get('password')
        auth = data.get('auth')

        # Search for the user in the database
        user = User.query.filter_by(userId=userId).first()

        if user:
            # Check if the user is banned
            if user.state == 0:
                return jsonify({'message': 'User is banned'}), 403  # Return 403 to indicate forbidden
            # Validate password and auth
            if user.password == password and user.auth == int(auth):
                user_data = {
                    'userId': user.userId,
                    'name': user.name,
                    'auth': user.auth
                }
                return jsonify(user_data), 201  # Return a JSON response with HTTP status code 201 (Created)
            else:
                return jsonify({'message': 'Invalid password or auth'}), 401  # Return 401 to indicate unauthorized
        else:
            return jsonify({'message': 'User not found'}), 404  # Return 404 to indicate not found

    @user_bp.route('/user/register', methods=['POST'])
    def post_user_register():
        # app = current_app._get_current_object()
        data = request.get_json()
        userId = data.get('userId')
        password = data.get('password')
        name = data.get('name')
        auth = data.get('auth')

        # Check if the user already exists
        existing_user = User.query.filter_by(userId=userId).first()

        if existing_user:
            return jsonify({'message': 'User already exists'}), 400

        # Create a new user
        new_user = User(userId=userId, password=password, name=name, auth=auth)
        db.session.add(new_user)
        db.session.commit()

        user_data = {
            'userId': new_user.userId,
            'name': new_user.name,
            'auth': new_user.auth
        }
        return jsonify(user_data), 201  # Return a JSON response with HTTP status code 201 (Created)

    # 删除用户及其相关的所有记录
    @user_bp.route('/user/delete', methods=['DELETE'])
    def delete_account():
        data = request.get_json()
        user_id = data['userId']

        try:
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
            return jsonify({'code': 0})  # 0 表示成功

        except Exception as e:
            # 发生异常，回滚事务
            db.session.rollback()
            # 返回错误码和错误信息
            return jsonify({'code': 1, 'message': str(e)})  # 1 表示失败

    # 获取所有用户信息（不包括管理员）
    @user_bp.route('/user/all', methods=['GET'])
    def get_all_user_infos():
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

        return jsonify({'code': 0, 'users': user_infos})

    # 编辑用户（名称, 状态）
    @user_bp.route('/user/edit', methods=['POST'])
    def post_modify_user():
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
            return jsonify({'code': 0})  # 0 表示成功

        return jsonify({'code': 1, 'message': 'User not found'})  # 1 表示失败，用户未找到

    return user_bp
