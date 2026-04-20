package com.falconeye.backend.config;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.hbase.HBaseConfiguration;
import org.apache.hadoop.hbase.client.Connection;
import org.apache.hadoop.hbase.client.ConnectionFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

import java.io.IOException;

@org.springframework.context.annotation.Configuration
public class HBaseConfig {

    @Value("${hbase.zookeeper.quorum}")
    private String zookeeperQuorum;

    @Value("${hbase.zookeeper.property.clientPort}")
    private String zookeeperClientPort;

    @Bean
    public Configuration hbaseConfiguration() {
        Configuration config = HBaseConfiguration.create();
        
        // Use the injected variable instead of a hardcoded string
        config.set("hbase.zookeeper.quorum", zookeeperQuorum); 
        config.set("hbase.zookeeper.property.clientPort", zookeeperClientPort);
        
        return config;
    }

    @Bean
    public Connection hbaseConnection(Configuration hbaseConfiguration) throws IOException {
        return ConnectionFactory.createConnection(hbaseConfiguration);
    }
}