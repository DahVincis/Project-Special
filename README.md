# Special Finishes Web Application

## Overview
The Special Finishes web application is designed to showcase the company's exceptional work in structural and decorative finishes. The application features a modern design and smooth user experience, highlighting various aspects of the company's offerings.

## Project Structure
```
.
├── client
│   ├── build
│   ├── node_modules
│   ├── public
│   │   ├── after.png
│   │   ├── before.png
│   │   ├── exterior.png
│   │   ├── favicon.ico
│   │   ├── hero1.png
│   │   ├── index.html
│   │   ├── interior.png
│   │   ├── manifest.json
│   │   ├── RF.png
│   │   ├── robots.txt
│   │   ├── sf7.png
│   │   ├── sp8.png
│   │   ├── special1.png
│   │   ├── special2.png
│   ├── src
│   │   ├── components
│   │   │   ├── About.css
│   │   │   ├── About.js
│   │   │   ├── ContactUs.css
│   │   │   ├── ContactUs.js
│   │   │   ├── Header.css
│   │   │   ├── Header.js
│   │   │   ├── HelloWorld.js
│   │   │   ├── MeetOwner.css
│   │   │   ├── MeetOwner.js
│   │   │   ├── OurWork.css
│   │   │   ├── OurWork.js
│   │   │   ├── ParallaxSection.css
│   │   │   ├── ParallaxSection.js
│   │   ├── api.js
│   │   ├── App.css
│   │   ├── App.js
│   │   ├── App.test.js
│   │   ├── index.css
│   │   ├── index.js
│   │   ├── logo.svg
│   │   ├── reportWebVitals.js
│   │   ├── setupTests.js
│   ├── .gitignore
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
├── special_finishes
│   ├── api
│   │   ├── __pycache__
│   │   ├── migrations
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   ├── views.py
│   ├── logs
│   ├── special_finishes
│   │   ├── __pycache__
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   ├── db.sqlite3
│   ├── manage.py
```

## Features
- **Parallax Section**: Visually appealing section with the company name.
- **About the Company**: Detailed information about Special Finishes.
- **Meet the Owner**: A section introducing the owner of the company.
- **Contact Us**: Contact details and form for reaching out to the company.
- **Our Work**: Slideshow of the company's past projects with descriptions.

## Technology Stack
- **Frontend**: React.js
- **Backend**: Django
- **Deployment**: AWS EC2 for the backend and AWS S3 for the frontend

## Deployment Details
The web application is deployed using AWS services:
- **Frontend**: Hosted on AWS S3 - [Special Finishes](http://specialfinishes.s3-website-us-east-1.amazonaws.com/)
- **Backend**: Hosted on AWS EC2 - [EC2 Instance](http://ec2-3-82-102-221.compute-1.amazonaws.com/)

## Setup Instructions

### Prerequisites
- Node.js
- Python
- AWS Account

### Local Development
1. Clone the repository:
    ```sh
    git clone https://github.com/DahVincis/Project-Special.git
    cd Project-Special
    ```

2. Set up the frontend:
    ```sh
    cd client
    npm install
    npm start
    ```

3. Set up the backend:
    ```sh
    cd ../special_finishes
    pip install -r requirements.txt
    python manage.py migrate
    python manage.py runserver
    ```

### Deployment to AWS
1. **Frontend**:
    - Build the React app:
        ```sh
        cd client
        npm run build
        ```
    - Deploy the build folder to S3.

2. **Backend**:
    - Launch an EC2 instance.
    - Configure the Django backend and deploy it to the EC2 instance.

## Author
Developed by [Your Name]

## License
This project is licensed under the MIT License.

---
