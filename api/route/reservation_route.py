from flask import Blueprint, jsonify, request
from model.registration import Registration, RegistrationDate
from model.reservation import Reservation, ReservationDate  # Import the Reservation model
from exts import db
from datetime import datetime
import logging

from model.user import User


def create_reservation_router():
    reservation_bp = Blueprint('reservation_bp', __name__)

    # 获取配置过的日志记录器
    logger = logging.getLogger('myapp')

    # 用户 or 服务商请求所有预约
    @reservation_bp.route('/reservation/all', methods=['GET'])
    def get_all_reservations():
        try:
            reservations = Reservation.query.all()
            reservations_data = []
            for reservation in reservations:
                # 获取创建该预约的服务商名称
                provider = User.query.filter_by(userId=reservation.userId).first()
                provider_name = provider.name if provider else "Unknown"

                # 获取注册了该预约的所有用户的名字
                registered_users = Registration.query.filter_by(reservation_id=reservation.id).all()
                usernames = []
                for reg_user in registered_users:
                    user = User.query.filter_by(userId=reg_user.userId).first()
                    if user:
                        usernames.append(user.name)

                if reservation.detail and isinstance(reservation.detail, bytes):
                    reservation.detail = reservation.detail.decode('utf-8')

                reservation_data = {
                    'id': reservation.id,
                    'name': reservation.name,
                    'provider': provider_name,  # 返回服务商用户名
                    'startTimeLimit': reservation.startTimeLimit.strftime('%H:%M'),
                    'endTimeLimit': reservation.endTimeLimit.strftime('%H:%M'),
                    'userId': reservation.userId,
                    'detail': reservation.detail,
                    'dates': [date.date.strftime('%Y-%m-%d') for date in reservation.dates],
                    'usernames': usernames  # 返回注册了该预约的所有用户的名字
                }
                reservations_data.append(reservation_data)

            response = {'code': 0, 'reservations': reservations_data}
            logger.info("Successfully retrieved all reservations.")
            return jsonify(response)

        except Exception as e:
            logger.error(f"Error in retrieving all reservations: {e}")
            return jsonify({'code': 1, 'error_message': str(e)}), 500

    @reservation_bp.route('/reservation/create', methods=['POST'])
    def post_create_reservation():
        try:
            data = request.get_json()
            dates = data['date']  # 数组形式的日期
            name = data['name']
            start_time_limit = datetime.strptime(data['startTimeLimit'], '%H:%M').time()
            end_time_limit = datetime.strptime(data['endTimeLimit'], '%H:%M').time()
            detail = data['detail']
            user_id = data['userId']  # 从请求中获取用户ID

            # 创建新的预约实例
            new_reservation = Reservation(
                name=name,
                startTimeLimit=start_time_limit,
                endTimeLimit=end_time_limit,
                detail=detail,
                userId=user_id
            )
            db.session.add(new_reservation)
            db.session.flush()  # 获取新创建的预约ID

            # 为每个日期创建一个 ReservationDate 实例
            for date_str in dates:
                date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
                new_date = ReservationDate(reservation_id=new_reservation.id, date=date_obj)
                db.session.add(new_date)

            db.session.commit()

            # 日志记录：成功创建新预约
            logger.info(f"New reservation created by user {user_id}.")
            return jsonify({'code': 0})  # 0 表示成功

        except Exception as e:
            # 处理异常，并记录错误日志
            logger.error(f"Error in creating reservation: {e}")
            return jsonify({'code': 1, 'message': str(e)}), 500  # 返回错误响应

    # 用户注册预约
    @reservation_bp.route('/reservation/register', methods=['POST'])
    def post_register_reservation():
        try:
            data = request.get_json()
            reservation_id = data['reservationId']
            time = ""
            selected_dates = ""
            user_id = data['userId']

            # 创建新的预约注册实例
            new_registration = Registration(
                reservation_id=reservation_id,
                time=time,
                userId=user_id
            )
            db.session.add(new_registration)
            db.session.flush()  # 获取新创建的预约注册ID

            # 为每个选择的日期创建一个 RegistrationDate 实例
            # for date_str in selected_dates:
            #     date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
            #     new_reg_date = RegistrationDate(
            #         registration_id=new_registration.id,
            #         selected_date=date_obj
            #     )
            #     db.session.add(new_reg_date)

            db.session.commit()

            # 日志记录：成功注册预约
            logger.info(f"User {user_id} registered for reservation {reservation_id}.")
            return jsonify({'code': 0})  # 0 表示成功

        except Exception as e:
            # 处理异常，并记录错误日志
            logger.error(f"Error in registering reservation: {e}")
            return jsonify({'code': 1, 'message': str(e)}), 500  # 返回错误响应

    # 用户请求注册过的预约
    @reservation_bp.route('/reservation/userRegister', methods=['GET'])
    def get_user_register_reservation():
        try:
            userId = request.args.get('userId')
            # userId 现在作为路径参数传入
            registrations = Registration.query.filter_by(userId=userId).all()
            reservations = []
            for registration in registrations:
                reservation = Reservation.query.get(registration.reservation_id)
                provider = User.query.filter_by(userId=reservation.userId).first()
                provider_name = provider.name if provider else "Unknown"

                if reservation and reservation.detail and isinstance(reservation.detail, bytes):
                    reservation.detail = reservation.detail.decode('utf-8')

                reservation_struct = {
                    'id': reservation.id,
                    'name': reservation.name,
                    'provider': provider_name,  # 返回服务商用户名
                    'startTimeLimit': reservation.startTimeLimit.strftime('%H:%M'),
                    'endTimeLimit': reservation.endTimeLimit.strftime('%H:%M'),
                    'detail': reservation.detail,
                    'date': [rd.date.strftime('%Y-%m-%d') for rd in reservation.dates]
                }
                reservations.append(reservation_struct)

            logger.info(f"User {userId} registered reservations retrieved successfully.")
            return jsonify({'code': 0, 'reservations': reservations})

        except Exception as e:
            logger.error(f"Error in retrieving user {userId} registered reservations: {e}")
            return jsonify({'code': 1, 'message': str(e)}), 500

    # 用户 or 服务商取消注册过的预约
    @reservation_bp.route('/reservation/cancel', methods=['POST'])
    def post_cancel_reservation():
        try:
            data = request.get_json()
            user_id = data['userId']
            reservation_id = data['reservationId']

            # 查找对应的预约注册记录
            registration = Registration.query.filter_by(
                userId=user_id, reservation_id=reservation_id
            ).first()

            if registration:
                # 如果找到了记录，删除它
                db.session.delete(registration)
                db.session.commit()
                logger.info(f"Reservation {reservation_id} cancelled by user {user_id}.")
                return jsonify({'code': 0})  # 0 表示成功

            # 如果没有找到记录，记录警告信息
            logger.warning(f"Reservation {reservation_id} to be cancelled not found for user {user_id}.")
            return jsonify({'code': 1})  # 1 表示操作失败

        except Exception as e:
            # 处理异常，并记录错误日志
            logger.error(f"Error in cancelling reservation: {e}")
            return jsonify({'code': 1, 'message': str(e)}), 500  # 返回错误响应

    @reservation_bp.route('/reservation/admin/cancel', methods=['POST'])
    def post_admin_cancel_reservation():
        try:
            data = request.get_json()
            reservation_id = data['reservationId']

            # 查找对应的预约记录
            reservation = Reservation.query.filter_by(id=reservation_id).first()

            if reservation:
                # 删除所有与预约相关的预约日期记录
                ReservationDate.query.filter_by(reservation_id=reservation.id).delete()

                # 查找所有与预约相关的预约注册记录
                registrations = Registration.query.filter_by(reservation_id=reservation.id).all()
                for reg in registrations:
                    # 删除与每个注册记录相关的所有注册日期记录
                    RegistrationDate.query.filter_by(registration_id=reg.id).delete()
                    db.session.delete(reg)

                # 删除预约记录本身
                db.session.delete(reservation)

                # 提交更改
                db.session.commit()
                logger.info(f"Reservation {reservation_id} and all associated records cancelled by admin.")
                return jsonify({'code': 0})  # 0 表示成功

            else:
                # 如果没有找到预约记录
                logger.warning(f"Reservation {reservation_id} to be cancelled not found.")
                return jsonify({'code': 1})  # 1 表示操作失败，预约未找到

        except Exception as e:
            # 发生异常，回滚事务
            db.session.rollback()
            logger.error(f"Error in admin cancelling reservation: {e}")
            return jsonify({'code': 1, 'message': str(e)}), 500  # 返回错误响应

    return reservation_bp  # Return the reservation Blueprint
