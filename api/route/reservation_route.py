from flask import Blueprint, jsonify, request
from model.registration import Registration, RegistrationDate
from model.reservation import Reservation, ReservationDate  # Import the Reservation model
from exts import db
from datetime import datetime

def create_reservation_router():
    reservation_bp = Blueprint('reservation_bp', __name__)

    @reservation_bp.route('/reservation/all', methods=['GET'])
    def get_all_reservations():
        try:
            # Retrieve all reservations from the database
            reservations = Reservation.query.all()

            reservations_data = []
            for reservation in reservations:
                if reservation.detail and isinstance(reservation.detail, bytes):
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

            # Prepare the response data
            response = {
                'code': 0,
                'reservations': reservations_data
            }

            return jsonify(response)  # Return a JSON response

        except Exception as e:
            # Handle exceptions and return an error response
            response = {
                'code': 1,
                'error_message': str(e)
            }
            return jsonify(response), 500  # HTTP status code 500 for internal server error

    # 服务商创建预约
    @reservation_bp.route('/reservation/create', methods=['POST'])
    def post_create_reservation():
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
            userId=user_id  # 使用从请求中获取的用户ID
        )
        db.session.add(new_reservation)
        db.session.flush()  # 获取新创建的预约ID

        # 为每个日期创建一个 ReservationDate 实例
        for date_str in dates:
            date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
            new_date = ReservationDate(reservation_id=new_reservation.id, date=date_obj)
            db.session.add(new_date)

        db.session.commit()

        return jsonify({'code': 0})  # 0 表示成功

    # 用户注册预约
    @reservation_bp.route('/reservation/register', methods=['POST'])
    def post_register_reservation():
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

        return jsonify({'code': 0})  # 0 表示成功

    # 用户请求注册过的预约
    @reservation_bp.route('/reservation/userRegister', methods=['GET'])
    def get_user_register_reservation():
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

        return jsonify({'code': 0, 'reservations': reservations})

    # 用户 or 服务商取消注册过的预约
    @reservation_bp.route('/reservation/cancel', methods=['POST'])
    def post_cancel_reservation():
        data = request.get_json()
        user_id = data['userId']
        reservation_id = data['reservationId']

        try:
            # 查找并删除所有相关的 reservation_date 记录
            ReservationDate.query.filter_by(reservation_id=reservation_id).delete()

            # 查找并删除对应的 registration 记录
            registration = Registration.query.filter_by(
                userId=user_id, reservation_id=reservation_id
            ).first()

            if registration:
                db.session.delete(registration)

            # 提交更改
            db.session.commit()
            return jsonify({'code': 0})  # 0 表示成功

        except Exception as e:
            # 发生异常，回滚事务
            db.session.rollback()
            # 返回错误码和错误信息
            return jsonify({'code': 1, 'message': str(e)})  # 1 表示失败

    return reservation_bp  # Return the reservation Blueprint
