package com.Prisma.PRISMA;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PrismaApplication {

	public static void main(String[] args) {
		SpringApplication.run(PrismaApplication.class, args);
	}

}

