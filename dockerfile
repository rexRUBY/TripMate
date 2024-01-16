FROM node:16

# 앱 의존성 설치
# 가능한 경우(npm@5+) package.json과 package-lock.json을 모두 복사하기 위해
# 와일드카드를 사용
COPY package.json .

RUN npm install
# 프로덕션을 위한 코드를 빌드하는 경우
# RUN npm ci --only=production

# 앱 소스 추가
COPY . .

# 유출 금지!!
# 중요 정보 -> 환경 변수
ENV DB_HOST='ls-04d555b86fd9547544e8a40647d45fc05d1dd27f.cap7lwx1qgpl.ap-northeast-2.rds.amazonaws.com' \ 
    DB_NAME='userinfo' \
    DB_USER='dbmasteruser' \
    DB_PASSWORD='Z8nc-e:pe|mY3^6zK{~jj0_)qH1PKk#F' \
    SALT='DLIIEOmVKgciVfW0hNb3vUv7W2Sd2IB7deWtoabPH2YbyennfjU2YDIzCdFBPHrGTh7bsQ+t5OqVNKSD/86S4ugzhSLJmWupLa48+Ab6IJNtWRZ3nGA0DZNGKXX9bwYJLearhKxSY0CdjOS44PVdUFLtnQOxBN4vOfytubOE5BM=' \
    S_SECRET='2HbYRcS3p8vdWf5M8J/EBeiyldFogor+sW4yD7/+3QvqhCADfOmw70uaqdqQqgzHwZFJ5LTrwkgNQMmBiWNSkBXngN93BL9/gpWYMv/ZRV8wnxHUn0YKrOUIY5pa0dnAzNseKbQm6V62b3TOt/pxAVIe28/O3dn5FjscEc8Kjgs='
# 유출 금지!!

EXPOSE 3000

CMD [ "node", "app.js" ]