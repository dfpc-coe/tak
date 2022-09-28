FROM ubuntu:22.04

WORKDIR /home/tak

RUN apt update \
    && apt install -y git default-jdk build-essential locales locales-all openjdk-11-jdk

ENV LC_ALL en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US.UTF-8

RUN git clone --depth 1 --branch "4.5-RELEASE-72" https://github.com/TAK-Product-Center/Server.git \
    && cd Server/src \
    && ./gradlew clean bootWar

