FROM python:latest

WORKDIR /app

ADD . /app

RUN pip3 install -r requirements.txt

EXPOSE 80

ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=80

CMD ["flask", "run"]