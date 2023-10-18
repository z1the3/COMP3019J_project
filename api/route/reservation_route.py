from flask import Blueprint, jsonify
from model.reservation import Reservation  # Import the Reservation model


def create_reservation_router():
    reservation_bp = Blueprint('reservation_bp', __name__)

    @reservation_bp.route('/reservation/all', methods=['GET'])
    def get_all_reservations():
        try:
            reservations = Reservation.query.all()  # Retrieve all reservations from the database

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

            response = {
                'code': 0,
                'reservations': reservations_data
            }

            return jsonify(response)  # Return a JSON response

        except Exception as e:
            response = {
                'code': 1,
                'error_message': str(e)
            }
            return jsonify(response), 500

    return reservation_bp
