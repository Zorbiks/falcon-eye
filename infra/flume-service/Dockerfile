FROM eclipse-temurin:8-jre-jammy

# ── Versions (pinned to match gradiant/hbase-master = HBase 2.0.1) ──────────
ENV FLUME_VERSION=1.11.0
ENV HBASE_VERSION=2.0.1
ENV FLUME_HOME=/opt/flume
ENV PATH=$FLUME_HOME/bin:$PATH

# ── System deps ──────────────────────────────────────────────────────────────
RUN apt-get update && \
    apt-get install -y --no-install-recommends wget netcat && \
    rm -rf /var/lib/apt/lists/*

# ── Install Flume 1.11 ───────────────────────────────────────────────────────
RUN wget -q "https://archive.apache.org/dist/flume/${FLUME_VERSION}/apache-flume-${FLUME_VERSION}-bin.tar.gz" && \
    tar -xzf "apache-flume-${FLUME_VERSION}-bin.tar.gz" && \
    mv "apache-flume-${FLUME_VERSION}-bin" "${FLUME_HOME}" && \
    rm "apache-flume-${FLUME_VERSION}-bin.tar.gz"

# ── Strip Flume's bundled HBase 1.x JARs ────────────────────────────────────
# Flume 1.11 ships old hbase-client 1.x jars that conflict with HBase 2.x.
# We remove them before adding the correct 2.0.1 ones.
RUN find "${FLUME_HOME}/lib" -name "hbase-*.jar" -delete && \
    find "${FLUME_HOME}/lib" -name "htrace-*.jar" -delete && \
    find "${FLUME_HOME}/lib" -name "protobuf-java-*.jar" -delete

# ── Download HBase 2.0.1 client JARs from Maven Central ─────────────────────
RUN wget -q -P "${FLUME_HOME}/lib" \
    "https://repo1.maven.org/maven2/org/apache/hbase/hbase-shaded-client/${HBASE_VERSION}/hbase-shaded-client-${HBASE_VERSION}.jar" && \
    wget -q -P "${FLUME_HOME}/lib" \
    "https://repo1.maven.org/maven2/org/apache/hbase/hbase-client/${HBASE_VERSION}/hbase-client-${HBASE_VERSION}.jar" && \
    wget -q -P "${FLUME_HOME}/lib" \
    "https://repo1.maven.org/maven2/org/apache/hbase/hbase-common/${HBASE_VERSION}/hbase-common-${HBASE_VERSION}.jar" && \
    wget -q -P "${FLUME_HOME}/lib" \
    "https://repo1.maven.org/maven2/org/apache/hbase/hbase-protocol-shaded/${HBASE_VERSION}/hbase-protocol-shaded-${HBASE_VERSION}.jar" && \
    wget -q -P "${FLUME_HOME}/lib" \
    "https://repo1.maven.org/maven2/org/apache/hbase/hbase-zookeeper/${HBASE_VERSION}/hbase-zookeeper-${HBASE_VERSION}.jar" && \
    wget -q -P "${FLUME_HOME}/lib" \
    "https://repo1.maven.org/maven2/org/apache/hbase/hbase-metrics-api/${HBASE_VERSION}/hbase-metrics-api-${HBASE_VERSION}.jar" && \
    wget -q -P "${FLUME_HOME}/lib" \
    "https://repo1.maven.org/maven2/org/apache/hbase/hbase-metrics/${HBASE_VERSION}/hbase-metrics-${HBASE_VERSION}.jar"

# ── Copy conf (flume.conf + hbase-site.xml) ──────────────────────────────────
COPY conf/ ${FLUME_HOME}/conf/

# ── Netcat source listens on 44444 ───────────────────────────────────────────
EXPOSE 44444

ENV FLUME_AGENT_NAME=agent

CMD flume-ng agent \
    --name ${FLUME_AGENT_NAME} \
    --conf ${FLUME_HOME}/conf \
    --conf-file ${FLUME_HOME}/conf/flume.conf \
    -Dflume.root.logger=INFO,console