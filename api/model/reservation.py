from exts import db

class Reservation(db.Model):
    __tablename__ = 'reservation'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    startTimeLimit = db.Column(db.Time, nullable=False)
    endTimeLimit = db.Column(db.Time, nullable=False)
    userId = db.Column(db.String(255), nullable=False)
    detail = db.Column(db.Text)

    # Define the relationship with ReservationDate
    dates = db.relationship('ReservationDate', backref='reservation', lazy=True)

    def __init__(self, name, startTimeLimit, endTimeLimit, userId, detail):
        self.name = name
        self.startTimeLimit = startTimeLimit
        self.endTimeLimit = endTimeLimit
        self.userId = userId
        self.detail = detail

class ReservationDate(db.Model):
    __tablename__ = 'reservation_date'

    id = db.Column(db.Integer, primary_key=True)
    reservation_id = db.Column(db.Integer, db.ForeignKey('reservation.id'), nullable=False)
    date = db.Column(db.Date, default=None)

    def __init__(self, reservation_id, date=None):
        self.reservation_id = reservation_id
        self.date = date