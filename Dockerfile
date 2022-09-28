FROM centos:centos7

EXPOSE 8443

WORKDIR /home/tak

RUN yum -y update \
    && yum -y install git patch epel-release wget \
                        java-11-openjdk java-11-openjdk-devel

ENV LC_ALL en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US.UTF-8

# --- Build TAK Server ---
RUN git clone --depth 1 --branch "4.5-RELEASE-72" https://github.com/TAK-Product-Center/Server.git \
    && cd Server/src/ \
    && export JAVA_HOME='/usr/lib/jvm/java-11-openjdk-11.0.16.1.1-1.el7_9.x86_64/' \
    && ./gradlew clean buildRpm

# --- Install TAK Server ---
RUN yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-7-x86_64/pgdg-redhat-repo-latest.noarch.rpm \
    && yum install -y postgresql10-server postgresql10-contrib postgis30_10 postgis30_10-utils openssl vim \
    && rpm -i $(ls ./Server/src/takserver-package/build/distributions/*.rpm)
