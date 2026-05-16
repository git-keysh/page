import os

try:
    from fpdf import FPDF
except ImportError:
    print("Installing required lightweight PDF package...")
    os.system("pip install fpdf2")
    from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        self.set_font('Helvetica', 'B', 12)
        self.cell(0, 10, 'CSEC Additional Mathematics - Past Paper Solutions', 0, 1, 'C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

    def chapter_title(self, title):
        self.set_font('Helvetica', 'B', 14)
        self.set_fill_color(230, 240, 255)
        self.cell(0, 10, title, 0, 1, 'L', fill=True)
        self.ln(4)

    def solution_body(self, text):
        self.set_font('Helvetica', '', 11)
        self.multi_cell(0, 6, text)
        self.ln(6)

def generate_pdf():
    pdf = PDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    
    # --- 2017 SOLUTIONS ---
    pdf.chapter_title("May/June 2017 Solutions")
    pdf.solution_body(
        "Question 8 (Kinematics):\n"
        "Given displacement s = t^3 - (52/2)t^2 - 2t.\n"
        "(i) Velocity v = ds/dt = 3t^2 - 52t - 2.\n"
        "At t = 3.5s, v = 3(3.5)^2 - 52(3.5) - 2 = 36.75 - 182 - 2 = -147.25 m/s.\n\n"
        "(ii) Momentarily at rest means v = 0 -> 3t^2 - 52t - 2 = 0.\n"
        "Using the quadratic formula: t = [52 +/- sqrt((-52)^2 - 4(3)(-2))] / (2*3)\n"
        "t = [52 +/- sqrt(2704 + 24)] / 6 = [52 +/- 52.23] / 6\n"
        "Since t >= 0, t = 104.23 / 6 = 17.37 seconds."
    )
    
    # --- 2023 SOLUTIONS ---
    pdf.chapter_title("May/June 2023 Solutions")
    pdf.solution_body(
        "Question 1 (Algebra & Functions):\n"
        "(a) Solve 3^(2x+1) - 5(3^x) - 2 = 0.\n"
        "Let u = 3^x, then 3(u^2) - 5u - 2 = 0.\n"
        "Factorizing: (3u + 1)(u - 2) = 0 -> u = -1/3 or u = 2.\n"
        "Since 3^x cannot be negative, 3^x = 2.\n"
        "Taking logs: x = log(2) / log(3) approx 0.631.\n\n"
        "(b) Given 3x+2 is a factor of 3x^3 + bx^2 - 3x - 2:\n"
        "By Remainder Theorem, f(-2/3) = 0.\n"
        "3(-2/3)^3 + b(-2/3)^2 - 3(-2/3) - 2 = 0\n"
        "-8/9 + 4b/9 + 2 - 2 = 0  ->  4b/9 = 8/9  ->  b = 2."
    )
    
    # --- 2024 SOLUTIONS ---
    pdf.chapter_title("May/June 2024 Solutions")
    pdf.solution_body(
        "Question 1 (Polynomials & Quadratics):\n"
        "(a) (i) Given x - 2 is a factor of 3x^3 + 8x^2 - 20x - 16.\n"
        "By long division or synthetic division, the quotient is 3x^2 + 14x + 8.\n"
        "Factorizing the quadratic: (3x + 2)(x + 4).\n"
        "The other linear factors are (3x + 2) and (x + 4).\n\n"
        "(ii) Simplify: [(3x^3 + 8x^2 - 20x - 16) / (x^2 - 4)] * [(x + 2) / (x + 4)]\n"
        "Substitute the factors: [(x - 2)(3x + 2)(x + 4) / ((x - 2)(x + 2))] * [(x + 2) / (x + 4)]\n"
        "Cancelling matching terms from top and bottom gives the final simplified result: 3x + 2."
    )

    output_filename = "csec_add_math_solutions.pdf"
    pdf.output(output_filename)
    print(f"\n Success! Generated '{output_filename}' inside your folder.")

if __name__ == "__main__":
    generate_pdf()