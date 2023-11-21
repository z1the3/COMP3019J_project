from exts import db


class User(db.Model):
    __tablename__ = 'user'

    userId = db.Column(db.String(255), primary_key=True)
    password = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(255), default=None)
    auth = db.Column(db.Integer(), default=None, comment='0: user, 1: administor')
    state = db.Column(db.Integer, default=1, comment='0: banned, 1: active')

    def __init__(self, userId, password, name=None, auth=None, state=1):
        self.userId = userId
        self.password = password
        self.name = name
        self.auth = auth
        self.state = state

    def __repr__(self):
        return f'<User {self.userId}>'
