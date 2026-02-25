import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-portfolio',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './portfolio.html',
    styleUrl: './portfolio.scss',
})
export class Portfolio {
    profile = {
        name: 'Trương Khánh',
        title: 'Java Developer',
        dob: '24/12/2002',
        gender: 'Nam',
        phone: '0902062846',
        email: 'khanhtruong326@gmail.com',
        address: 'Da Nang, Viet Nam',
    };

    overview = [
        'Strengths: Front-end technology and Back-end web application development. Proficiency in HTML, CSS, JavaScript.',
        'Strong proficiency in JavaScript, including DOM manipulation and the JavaScript object model. Experience with data structure libraries.',
        'Familiarity with RESTful APIs. Proficient use of source code management tools: SVN, GIT.',
        'Ability to learn and apply new technology quickly.',
        'I am a studious and team player who have a strong passion with a demonstrated history of working in the computer software industry. With the ability to work in a difficult setting, I have the confidence to take on difficult tasks and am willing to correct my mistakes.',
    ];

    education = [
        {
            period: '2020 - 2024',
            school: 'UED University',
            major: 'Major: Information Technology',
            gpa: 'GPA: 3.2/4',
        },
    ];

    experience = [
        {
            period: '08/2023 - 1/2024',
            company: 'RikkeiSoft',
            role: 'FE Developer NextJs',
            tasks: ['Programme outsourcing projects', 'Create coding frames and design database based on project descriptions'],
        },
        {
            period: '4/2024 - 4/2025',
            company: 'FPT Software',
            role: 'Fresher Java Developer',
            tasks: [
                'Programme outsourcing projects',
                'Fix bugs and optimize code (Debug, read logs, check errors).',
                'Develop CRUD APIs (Spring Boot + RESTful API).',
                'Write Unit Tests & Fix code reviews (JUnit, Mockito).',
                'Work with databases (SQL, Hibernate, JPA). Learn AWS cloud.',
            ],
        },
        {
            period: '5/2025 - Present',
            company: 'MakeAI',
            role: 'Developer & BA',
            tasks: ['Programme product project.', 'Education system analysis.', 'Using ERP system for digital transformation.'],
        },
    ];

    certificates = ['Ielts 6.0 (2023)', 'JLPT N4 (2020)'];

    skills = [
        { category: 'Main', items: ['HTML, CSS, JavaScript (ReactJS)', 'Java (OOP, Spring MVC, SpringBoot, Hibernate)', 'ERP System (ErpNext)', 'Node (ExpressJS), Node (ExpressJS)', 'MySQL, SQL Server, NoSQL (MongoDB)', 'AWS (Load balancing, EC2, S3)'] },
    ];
}
