FROM centos:centos7

EXPOSE 8080
EXPOSE 8081

WORKDIR /home/tak

RUN yum -y update \
    && yum -y install git patch epel-release wget psmisc \
                        java-11-openjdk java-11-openjdk-devel glibc

ENV LC_ALL en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US.UTF-8

COPY build/distributions/takserver.rpm .

# --- Install TAK Server ---
RUN yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-7-x86_64/pgdg-redhat-repo-latest.noarch.rpm \
    && yum install -y postgresql10-server postgresql10-contrib postgis30_10 postgis30_10-utils openssl vim \
                        yum install s3fs-fuse \
    && rpm -i takserver.rpm

# --- Configure TAK Server ---
WORKDIR /opt/tak

COPY . ./tak-ps/
COPY assets/CoreConfig.xml /opt/tak/CoreConfig.xml

COPY assets/nginx-core.conf /etc/nginx/nginx.conf
COPY assets/nginx-health.conf /etc/nginx/sites-enabled/healthy.conf

RUN yum install -y nginx

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash \
    && source ~/.bashrc \
    && nvm install 16 \
    && cd tak-ps \
    && npm install \
    && ln -s $(which node) /usr/bin/ \
    && ln -s $(which npm) /usr/bin/

CMD ["node", "./tak-ps/start.js"]
