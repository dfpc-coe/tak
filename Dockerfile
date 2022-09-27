FROM ubuntu:22.04

RUN apt update \
    && apt install -y git default-jdk build-essential \
    && git clone --depth 1 --branch "4.5-RELEASE-72" https://github.com/TAK-Product-Center/Server.git \
    && cd Server/src \
    && ./gradlew clean bootWar

