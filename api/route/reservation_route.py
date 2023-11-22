from flask import Blueprint, jsonify, request
from model.registration import Registration, RegistrationDate
from model.reservation import Reservation, ReservationDate  # Import the Reservation model
from exts import db
from datetime import datetime
import logging

def create_reservation_router():
    reservation_bp = Blueprint('reservation_bp', __name__)

    # 获取配置过的日志记录器
    logger = logging.getLogger('myapp')

    # 用户 or 服务商请求所有预约
    @reservation_bp.route('/reservation/all', methods=['GET'])
    def get_all_reservations():
        try:
            # 从数据库检索所有预约
            reservations = Reservation.query.all()

            reservations_data = []
            for reservation in reservations:
                if reservation.detail and isinstance(reservation.detail, bytes):
                    # 解码详情字段，如果它是字节类型
                    reservation.detail = reservation.detail.decode('utf-8')
                reservation_data = {
                    'id': reservation.id,
                    'name': reservation.name,
                    'startTimeLimit': reservation.startTimeLimit.strftime('%H:%M'),
                    'endTimeLimit': reservation.endTimeLimit.strftime('%H:%M'),
                    'userId': reservation.userId,
                    'detail': reservation.detail,
                    'dates': [date.date.strftime('%Y-%m-%d') for date in reservation.dates]
                }
                reservations_data.append(reservation_data)

            response = {
                'code': 0,
                'reservations': reservations_data
            }

            # 日志记录：成功检索到所有预约
            logger.info("Successfully retrieved all reservations.")
            return jsonify(response)  # 返回一个JSON响应

        except Exception as e:
            # 处理异常并返回错误响应
            logger.error(f"Error in retrieving all reservations: {e}")
            response = {
                'code': 1,
                'error_message': str(e)
            }
            return jsonify(response), 500  # HTTP状态码500表示内部服务器错误

    # 服务商创建预约
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
            time = datetime.strptime(data['time'], '%H:%M').time()
            selected_dates = data['selectedDate']
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
            for date_str in selected_dates:
                date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
                new_reg_date = RegistrationDate(
                    registration_id=new_registration.id,
                    selected_date=date_obj
                )
                db.session.add(new_reg_date)

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
            data = request.get_json()
            user_id = data['userId']

            # 查询用户注册过的预约
            registrations = Registration.query.filter_by(userId=user_id).all()

            reservations = []
            for registration in registrations:
                # 获取与注册记录相关的预约信息
                reservation = Reservation.query.get(registration.reservation_id)
                if reservation.detail and isinstance(reservation.detail, bytes):
                    reservation.detail = reservation.detail.decode('utf-8')
                if reservation:
                    reservation_struct = {
                        'id': reservation.id,
                        'userId': reservation.userId,
                        'name': reservation.name,
                        'startTimeLimit': reservation.startTimeLimit.strftime('%H:%M'),
                        'endTimeLimit': reservation.endTimeLimit.strftime('%H:%M'),
                        'detail': reservation.detail,
                        'date': [rd.date.strftime('%Y-%m-%d') for rd in reservation.dates]
                    }
                    reservations.append(reservation_struct)

            logger.info(f"User {user_id} registered reservations retrieved successfully.")
            return jsonify({'code': 0, 'reservations': reservations})

        except Exception as e:
            logger.error(f"Error in retrieving user {user_id} registered reservations: {e}")
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

    return reservation_bp  # Return the reservation Blueprint
