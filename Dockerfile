FROM ubuntu:22.04
LABEL version="1.0"

# Generate locale C.UTF-8
ENV LANG=C.UTF-8
# Create default timezone as UTC
ENV TZ=UTC
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Expose ports
EXPOSE 8080/tcp

RUN apt update \
  && apt upgrade -y \
  && apt install -y --no-install-recommends \
    ca-certificates \
    curl \
    htop \
    iotop \
    rsync \
    tar \
    vim \
    nano \
    unzip \
    locate \
    wget \
    iproute2 \
  && apt clean all \
  && apt autoremove

# install dependencies
RUN apt-get install -y --no-install-recommends \
    freeglut3-dev \
    perl \
    build-essential \
    libgtk2.0-dev \
    libwxgtk3.0-gtk3-dev \
    libwx-perl \
    libmodule-build-perl \
    git \
    cpanminus \
    libextutils-cppguess-perl \
    libboost-all-dev \
    libxmu-dev \
    liblocal-lib-perl \
    wx-common \
    libopengl-perl \
    libwx-glcanvas-perl \
    libtbb-dev \
    libxmu-dev \
    freeglut3-dev \
    libwxgtk-media3.0-gtk3-dev \
    libboost-thread-dev \
    libboost-system-dev \
    libboost-filesystem-dev \
    libcurl4-openssl-dev

RUN apt update \
    && apt upgrade -y \
    && apt clean all \
    && apt autoremove

# Create root folder
RUN mkdir -p /app/Slic3r
WORKDIR /app
RUN echo "#!/bin/sh" > install
RUN echo "echo 'Downloading latest Slic3r repo from GitHub...'" >> install
RUN echo "git clone https://github.com/alexrj/Slic3r.git" >> install
RUN echo "cd Slic3r" >> install
RUN echo "export LDLOADLIBS=-lstdc++" >> install
RUN echo "echo 'Building Slic3r....'" >> install
RUN echo "perl Build.PL" >> install
RUN echo "echo 'Building completed successfully.'" >> install
RUN chmod +x ./install

RUN echo "#!/bin/sh" > slicer
RUN echo "(i=$# ; while [ $i -gt 0 ] ; do echo $1 ; shift ; i=$(expr $i - 1) ; done) | xargs -d \'\\n\'perl /app/Slic3r/slic3r.pl" >> slicer
RUN chmod +x ./slicer
