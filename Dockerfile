FROM centos:centos7

EXPOSE 8443
EXPOSE 8446
EXPOSE 8080

WORKDIR /home/tak

RUN yum -y update \
    && yum -y install git patch epel-release wget psmisc nginx \
                        java-11-openjdk java-11-openjdk-devel glibc

ENV LC_ALL en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US.UTF-8

COPY build/distributions/takserver.rpm .

# --- Install TAK Server ---
RUN yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-7-x86_64/pgdg-redhat-repo-latest.noarch.rpm \
    && yum install -y postgresql10-server postgresql10-contrib postgis30_10 postgis30_10-utils openssl vim \
    && rpm -i takserver.rpm

# --- Configure TAK Server ---
WORKDIR /opt/tak

COPY . ./tak-ps/
COPY assets/CoreConfig.xml /opt/tak/CoreConfig.xml

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash \
    && source ~/.bashrc \
    && nvm install 18

CMD ["node", "./tak-ps/start.js"]

# java -jar ./db-utils/SchemaManager.jar upgrade
#
# export STATE=co
# export CITY=grand_junction
# export ORGANIZATIONAL_UNIT=coe
# cd certs
# ./makeRootCa.sh
# ./makeCert.sh server takserver
# ./makeCert.sh client admin
# cd ..
# ./start.sh
#
# java -jar ./utils/UserManager.jar usermod -A -p 1amTheDefaultPassword default
# java -jar utils/UserManager.jar certmod -A certs/files/admin.pem
