from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/python-course')
def python_course():
    return render_template('python_course.html')

@app.route('/industrial-course')
def industrial_course():
    return render_template('industrial_course.html')

if __name__ == '__main__':
    app.run(debug=True)
