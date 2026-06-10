export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">V</span>
          </div>
          <span className="font-bold text-gray-800">Veloxa</span>
        </a>
        <a href="/" className="text-sm text-gray-500 hover:text-blue-600">
          ← Back to Home
        </a>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 ">
        <style>{`
          [data-custom-class='body'], [data-custom-class='body'] * {
            background: transparent !important;
          }
          [data-custom-class='title'], [data-custom-class='title'] * {
            font-family: Arial !important;
            font-size: 26px !important;
            color: #000000 !important;
          }
          [data-custom-class='subtitle'], [data-custom-class='subtitle'] * {
            font-family: Arial !important;
            color: #595959 !important;
            font-size: 14px !important;
          }
          [data-custom-class='heading_1'], [data-custom-class='heading_1'] * {
            font-family: Arial !important;
            font-size: 19px !important;
            color: #000000 !important;
          }
          [data-custom-class='heading_2'], [data-custom-class='heading_2'] * {
            font-family: Arial !important;
            font-size: 17px !important;
            color: #000000 !important;
          }
          [data-custom-class='body_text'], [data-custom-class='body_text'] * {
            color: #595959 !important;
            font-size: 14px !important;
            font-family: Arial !important;
          }
          [data-custom-class='link'], [data-custom-class='link'] * {
            color: #3030F1 !important;
            font-size: 14px !important;
            font-family: Arial !important;
            word-break: break-word !important;
          }
          ul { list-style-type: square; }
          ul > li > ul { list-style-type: circle; }
          ul > li > ul > li > ul { list-style-type: square; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid black; padding: 8px; text-align: left; }
        `}</style>
        <div 
          dangerouslySetInnerHTML={{ 
            __html: `<span style="display: block;margin: 0 auto 3.125rem;width: 11.125rem;height: 2.375rem;background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNzgiIGhlaWdodD0iMzgiIHZpZXdCb3g9IjAgMCAxNzggMzgiPgogICAgPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8cGF0aCBmaWxsPSIjRDFEMUQxIiBkPSJNNC4yODMgMjQuMTA3Yy0uNzA1IDAtMS4yNTgtLjI1Ni0xLjY2LS43NjhoLS4wODVjLjA1Ny41MDIuMDg2Ljc5Mi4wODYuODd2Mi40MzRILjk4NXYtOC42NDhoMS4zMzJsLjIzMS43NzloLjA3NmMuMzgzLS41OTQuOTUtLjg5MiAxLjcwMi0uODkyLjcxIDAgMS4yNjQuMjc0IDEuNjY1LjgyMi40MDEuNTQ4LjYwMiAxLjMwOS42MDIgMi4yODMgMCAuNjQtLjA5NCAxLjE5OC0uMjgyIDEuNjctLjE4OC40NzMtLjQ1Ni44MzMtLjgwMyAxLjA4LS4zNDcuMjQ3LS43NTYuMzctMS4yMjUuMzd6TTMuOCAxOS4xOTNjLS40MDUgMC0uNy4xMjQtLjg4Ni4zNzMtLjE4Ny4yNDktLjI4My42Ni0uMjkgMS4yMzN2LjE3N2MwIC42NDUuMDk1IDEuMTA3LjI4NyAxLjM4Ni4xOTIuMjguNDk1LjQxOS45MS40MTkuNzM0IDAgMS4xMDEtLjYwNSAxLjEwMS0xLjgxNiAwLS41OS0uMDktMS4wMzQtLjI3LTEuMzI5LS4xODItLjI5NS0uNDY1LS40NDMtLjg1Mi0uNDQzem01LjU3IDEuNzk0YzAgLjU5NC4wOTggMS4wNDQuMjkzIDEuMzQ4LjE5Ni4zMDQuNTEzLjQ1Ny45NTQuNDU3LjQzNyAwIC43NS0uMTUyLjk0Mi0uNDU0LjE5Mi0uMzAzLjI4OC0uNzUzLjI4OC0xLjM1MSAwLS41OTUtLjA5Ny0xLjA0LS4yOS0xLjMzOC0uMTk0LS4yOTctLjUxLS40NDUtLjk1LS40NDUtLjQzOCAwLS43NTMuMTQ3LS45NDYuNDQzLS4xOTQuMjk1LS4yOS43NDItLjI5IDEuMzR6bTQuMTUzIDBjMCAuOTc3LS4yNTggMS43NDItLjc3NCAyLjI5My0uNTE1LjU1Mi0xLjIzMy44MjctMi4xNTQuODI3LS41NzYgMC0xLjA4NS0uMTI2LTEuNTI1LS4zNzhhMi41MiAyLjUyIDAgMCAxLTEuMDE1LTEuMDg4Yy0uMjM3LS40NzMtLjM1NS0xLjAyNC0uMzU1LTEuNjU0IDAtLjk4MS4yNTYtMS43NDQuNzY4LTIuMjg4LjUxMi0uNTQ1IDEuMjMyLS44MTcgMi4xNi0uODE3LjU3NiAwIDEuMDg1LjEyNiAxLjUyNS4zNzYuNDQuMjUxLjc3OS42MSAxLjAxNSAxLjA4LjIzNi40NjkuMzU1IDEuMDE5LjM1NSAxLjY0OXpNMTkuNzEgMjRsLS40NjItMi4xLS42MjMtMi42NTNoLS4wMzdMMTcuNDkzIDI0SDE1LjczbC0xLjcwOC02LjAwNWgxLjYzM2wuNjkzIDIuNjU5Yy4xMS40NzYuMjI0IDEuMTMzLjMzOCAxLjk3MWguMDMyYy4wMTUtLjI3Mi4wNzctLjcwNC4xODgtMS4yOTRsLjA4Ni0uNDU3Ljc0Mi0yLjg3OWgxLjgwNGwuNzA0IDIuODc5Yy4wMTQuMDc5LjAzNy4xOTUuMDY3LjM1YTIwLjk5OCAyMC45OTggMCAwIDEgLjE2NyAxLjAwMmMuMDIzLjE2NS4wMzYuMjk5LjA0LjM5OWguMDMyYy4wMzItLjI1OC4wOS0uNjExLjE3Mi0xLjA2LjA4Mi0uNDUuMTQxLS43NTQuMTc3LS45MTFsLjcyLTIuNjU5aDEuNjA2TDIxLjQ5NCAyNGgtMS43ODN6bTcuMDg2LTQuOTUyYy0uMzQ4IDAtLjYyLjExLS44MTcuMzMtLjE5Ny4yMi0uMzEuNTMzLS4zMzguOTM3aDIuMjk5Yy0uMDA4LS40MDQtLjExMy0uNzE3LS4zMTctLjkzNy0uMjA0LS4yMi0uNDgtLjMzLS44MjctLjMzem0uMjMgNS4wNmMtLjk2NiAwLTEuNzIyLS4yNjctMi4yNjYtLjgtLjU0NC0uNTM0LS44MTYtMS4yOS0uODE2LTIuMjY3IDAtMS4wMDcuMjUxLTEuNzg1Ljc1NC0yLjMzNC41MDMtLjU1IDEuMTk5LS44MjUgMi4wODctLjgyNS44NDggMCAxLjUxLjI0MiAxLjk4Mi43MjUuNDcyLjQ4NC43MDkgMS4xNTIuNzA5IDIuMDA0di43OTVoLTMuODczYy4wMTguNDY1LjE1Ni44MjkuNDE0IDEuMDkuMjU4LjI2MS42Mi4zOTIgMS4wODUuMzkyLjM2MSAwIC43MDMtLjAzNyAxLjAyNi0uMTEzYTUuMTMzIDUuMTMzIDAgMCAwIDEuMDEtLjM2djEuMjY4Yy0uMjg3LjE0My0uNTkzLjI1LS45Mi4zMmE1Ljc5IDUuNzkgMCAwIDEtMS4xOTEuMTA0em03LjI1My02LjIyNmMuMjIyIDAgLjQwNi4wMTYuNTUzLjA0OWwtLjEyNCAxLjUzNmExLjg3NyAxLjg3NyAwIDAgMC0uNDgzLS4wNTRjLS41MjMgMC0uOTMuMTM0LTEuMjIyLjQwMy0uMjkyLjI2OC0uNDM4LjY0NC0uNDM4IDEuMTI4VjI0aC0xLjYzOHYtNi4wMDVoMS4yNGwuMjQyIDEuMDFoLjA4Yy4xODctLjMzNy40MzktLjYwOC43NTYtLjgxNGExLjg2IDEuODYgMCAwIDEgMS4wMzQtLjMwOXptNC4wMjkgMS4xNjZjLS4zNDcgMC0uNjIuMTEtLjgxNy4zMy0uMTk3LjIyLS4zMS41MzMtLjMzOC45MzdoMi4yOTljLS4wMDctLjQwNC0uMTEzLS43MTctLjMxNy0uOTM3LS4yMDQtLjIyLS40OC0uMzMtLjgyNy0uMzN6bS4yMyA1LjA2Yy0uOTY2IDAtMS43MjItLjI2Ny0yLjI2Ni0uOC0uNTQ0LS41MzQtLjgxNi0xLjI5LS44MTYtMi4yNjcgMC0xLjAwNy4yNTEtMS43ODUuNzU0LTIuMzM0LjUwNC0uNTUgMS4yLS44MjUgMi4wODctLjgyNS44NDkgMCAxLjUxLjI0MiAxLjk4Mi43MjUuNDczLjQ4NC43MDkgMS4xNTIuNzA5IDIuMDA0di43OTVoLTMuODczYy4wMTguNDY1LjE1Ni44MjkuNDE0IDEuMDkuMjU4LjI2MS42Mi4zOTIgMS4wODUuMzkyLjM2MiAwIC43MDQtLjAzNyAxLjAyNi0uMTEzYTUuMTMzIDUuMTMzIDAgMCAwIDEuMDEtLjM2djEuMjY4Yy0uMjg3LjE0My0uNTkzLjI1LS45MTkuMzJhNS43OSA1Ljc5IDAgMCAxLTEuMTkyLjEwNHptNS44MDMgMGMtLjcwNiAwLTEuMjYtLjI3NS0xLjY2My0uODIyLS40MDMtLjU0OC0uNjA0LTEuMzA3LS42MDQtMi4yNzggMC0uOTg0LjIwNS0xLjc1Mi42MTUtMi4zMDEuNDEtLjU1Ljk3NS0uODI1IDEuNjk1LS44MjUuNzU1IDAgMS4zMzIuMjk0IDEuNzI5Ljg4MWguMDU0YTYuNjk3IDYuNjk3IDAgMCAxLS4xMjQtMS4xOTh2LTEuOTIyaDAuNjQ0VjI0SDQ2LjQzbC0uMzE3LS43NzloLS4wN2MtLjM3Mi41OTEtLjk0Ljg4Ni0xLjcwMi44ODZ6bS41NzQtMS4zMDZjLjQyIDAgLjcyNi0uMTIxLjkyMS0uMzY1LjE5Ni0uMjQzLjMwMi0uNjU3LjMyLTEuMjR2LS4xNzhjMC0uNjQ0LS4xLTEuMTA2LS4yOTgtMS4zODYtLjE5OS0uMjc5LS41MjItLjQxOS0uOTctLjQxOWEuOTYyLjk2MiAwIDAgMC0uODUuNDY1Yy0uMjAzLjMxLS4zMDQuNzYtLjMwNCAxLjM1IDAgLjU5Mi4xMDIgMS4wMzUuMzA2IDEuMzMuMjA0LjI5Ni40OTYuNDQzLjg3NS40NDN6bTEwLjkyMi00LjkyYy43MDkgMCAxLjI2NC4yNzcgMS42NjUuODMuNC41NTMuNjAxIDEuMzEyLjYwMSAyLjI3NSAwIC45OTItLjIwNiAxLjc2LS42MiAyLjMwNC0uNDE0LjU0NC0uOTc3LjgxNi0xLjY5LjgxNi0uNzA1IDAtMS4yNTgtLjI1Ni0xLjY1OS0uNzY4aC0uMTEzbC0uMjc0LjY2MWgtMS4yNTF2LTguMzU3aDAuNjM4djEuOTQ0YzAgLjI0Ny0uMDIxLjY0My0uMDY0IDEuMTg3aC4wNjRjLjM4My0uNTk0Ljk1LS44OTIgMS43MDMtLjg5MnptLS41MjcgMS4zMWMtLjQwNCAwLS43LjEyNS0uODg2LjM3NC0uMTg2LjI0OS0uMjgzLjY2LS4yOSAxLjIzM3YuMTc3YzAgLjY0NS4wOTYgMS4xMDcuMjg3IDEuMzg2LjE5Mi4yOC40OTUuNDE5LjkxLjQxOS4zMzcgMCAuNjA1LS4xNTUuODA0LS40NjUuMTk5LS4zMS4yOTgtLjc2LjI5OC0xLjM1IDAtLjU5MS0uMS0xLjAzNS0uMy0xLjMzYS45NDMuOTQzIDAgMCAwLS44MjMtLjQ0M3ptMy4xODYtMS4xOTdoMS43OTRsMS4xMzQgMy4zNzlj.MDk2LjI5My4xNjMuNjQuMTk4IDEuMDQyaC4wMzNjLjAzOS0uMzcuMTE2LS43MTcuMjMtMS4wNDJsMi4xMTItMy4zNzloMS43NTdsLTIuNTQgNi43NzNjLS4yMzQuNjI3LS41NjYgMS4wOTYtLjk5NyAxLjQwNy0uNDMyLjMxMi0uOTM2LjQ2OC0xLjUxMi40NjgtLjI4MyAwLS41Ni0uMDMtLjgzMy0uMDkydi0xLjNhMi44IDIuOCAwIDAgMCAuNjQ1LjA3Yy4yOSAwIC41NDMtLjA4OC43Ni0uMjY2LjIxNy0uMTc3LjM4Ni0uNDQ0LjUwOC0uODAzbC4wOTYtLjI5NS0yLjM4NS01Ljk2MnoiLz4KICAgICAgICA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSg3MykiPgogICAgICAgICAgICA8Y2lyY2xlIGN4PSIxOSIgY3k9IjE5IiByPSIxOSIgZmlsbD0iI0UwRTBFMCIvPgogICAgICAgICAgICA8cGF0aCBmaWxsPSIjRkZGIiBkPSJNMjIuNDc0IDE1LjQ0M2g1LjE2MkwxMi40MzYgMzAuNFYxMC4zNjNoMTUuMmwtNS4xNjIgNS4wOHoiLz4KICAgICAgICAgIDwvZz4KICAgICAgICA8cGF0aCBmaWxsPSIjRDJEMkQyIiBkPSJNMTIxLjU0NCAxNC41Ni12LTEuNzI4aDguMjcydjEuNzI4aC0zLjAyNFYyNGgtMi4yNHYtOS40NGgtMy4wMDh6bTEzLjc0NCA5LjU2OGMtMS4yOSAwLTIuMzQxLS40MTktMy4xNTItMS4yNTYtLjgxLS44MzctMS4yMTYtMS45NDQtMS4yMTYtMy4zMnMuNDA4LTIuNDc3IDEuMjI0LTMuMzA0YzguODE2LS44MjcgMS44NzItMS4yNCAzLjE2OC0xLjI0czIuMzYuNDAzIDMuMTkyIDEuMjA4Yy44MzIuODA1IDEuMjQ4IDEuODggMS4yNDggMy4yMjQgMCAuMzEtLjAyMS41OTctLjA2NC44NjRoLTYuNDY0Yy4wNTMuNTc2LjI2NyAxLjA0LjY0IDEuMzkyLjM3My4zNTIuODQ4LjUyOCAxLjQyNC41MjguNzc5IDAgMS4zNTUtLjMyIDEuNzI4LS45NmgyLjQzMmEzLjg5MSAzLjg5MSAwIDAgMS0xLjQ4OCAyLjA2NGMtLjczNi41MzMtMS42MjcuOC0yLjY3Mi44em0xLjQ4LTYuNjg4Yy0uNC0uMzUyLS44ODMtLjUyOC0xLjQ0OC0uNTI4cy0xLjAzNy4xNzYtMS40MTYuNTI4Yy0uMzc5LjM1Mi0uNjA1LjgyMS0uNjguMTQwOGg0LjE5MmMtLjAzMi0uNTg3LS4yNDgtMS4wNTYtLjY0OC0xLjQwOHptNy4wMTYtMi4zMDR2MS41NjhjLjU5Ny0xLjEzIDEuNDYxLTEuNjk2IDIuNTkyLTEuNjk2djIuMzA0aC0uNTZjLS42NzIgMC0xLjE3OS4xNjgtMS41Mi41MDQtLjM0MS4zMzYtLjUxMi45MTUtLjUxMiAxLjczNlYyNGgtMi4yNTZ2LTguODY0aDIuMjU2em02LjQ0OCAwdjEuMzI4Yy41NjUtLjk3IDEuNDgzLTEuNDU2IDIuNzUyLTEuNDU2LjY3MiAwIDEuMjcyLjE1NSAxLjguNDY0LjUyOC4zMS45MzYuNzUyIDEuMjI0IDEuMzI4LjMxLS41NTUuNzMzLS45OTIgMS4yNzItMS4zMTJhMy40ODggMy40ODggMCAwIDEgMS44MTYtLjQ4YzEuMDU2IDAgMS45MDcuMzMgMi41NTIuOTkyLjY0NS42NjEuOTY4IDEuNTkuOTY4IDIuNzg0VjI0aC0yLjI0di00Ljg5NmMwLS42OTMtLjE3Ni0xLjIyNC0uNTI4LTEuNTkyLS4zNTItLjM2OC0uODMyLS41NTItMS40NC0uNTUycy0xLjA5LjE4NC0xLjQ0OC41NTJjLS4zNTcuMzY4LS41MzYuODk5LS41MzYgMS41OTJWMjRoLTIuMjR2LTQuODk2YzAtLjY5My0uMTc2LTEuMjI0LS41MjgtMS41OTItLjM1Mi0uMzY4LS44MzItLjU1Mi0xLjQ0LS41NTJzLTEuMDkuMTg0LTEuNDQ4LjU1MmMtLjM1Ny4zNjgtLjUzNi44OTktLjUzNiAxLjU5MlYyNGgtMi4yNTZ2LTguODY0aDIuMjU2ek0xNjQuOTM2IDI0VjEyLjE2aDIuMjU2VjI0aC0yLjI1NnptNy4wNC0uMTZsLTMuNDcyLTguNzA0aDIuNTI4bDIuMjU2IDYuMzA0IDIuMzg0LTYuMzA0aDIuMzUybC01LjUzNiAxMy4wNTZoLTIuMzUybDEuODQtNC4zNTJ6Ii8+CiAgICA8L2c+Cjwvc3ZnPgo=) center no-repeat;"></span>
          <div data-custom-class="body">
          <div><strong><span style="font-size: 26px;"><span data-custom-class="title"><h1>PRIVACY POLICY</h1></span></span></strong></div>
          <div><span style="color: rgb(127, 127, 127);"><strong><span style="font-size: 15px;"><span data-custom-class="subtitle">Last updated June 10, 2026</span></span></strong></span></div>
          <div><br></div>
          <div style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="font-size: 15px;"><span data-custom-class="body_text">This Privacy Notice for <strong>Veloxa AI</strong> ("<strong>we</strong>," "<strong>us</strong>," or "<strong>our</strong>"), describes how and why we might access, collect, store, use, and/or share ("<strong>process</strong>") your personal information when you use our services ("<strong>Services</strong>").</span></span></span></div>
          <div><br></div>
          <div style="line-height: 1.5;"><strong><span style="font-size: 15px;"><span data-custom-class="heading_1"><h2>1. WHAT INFORMATION DO WE COLLECT?</h2></span></span></strong></div>
          <div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>Personal Information Provided by You:</strong> We collect personal information including names, email addresses, passwords, billing addresses, debit/credit card numbers, and job titles.</span></span></div>
          <div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>Information automatically collected:</strong> Such as your Internet Protocol (IP) address and/or browser and device characteristics.</span></span></div>
          <div style="line-height: 1.5;"><br></div>
          <div style="line-height: 1.5;"><strong><span style="font-size: 15px;"><span data-custom-class="heading_1"><h2>2. HOW DO WE PROCESS YOUR INFORMATION?</h2></span></span></strong></div>
          <div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.</span></span></div>
          <div style="line-height: 1.5;"><br></div>
          <div style="line-height: 1.5;"><strong><span style="font-size: 15px;"><span data-custom-class="heading_1"><h2>3. WHAT LEGAL BASES DO WE RELY ON?</h2></span></span></strong></div>
          <div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">We rely on your consent, performance of contracts, legal obligations, and vital interests to process your information.</span></span></div>
          <div style="line-height: 1.5;"><br></div>
          <div style="line-height: 1.5;"><strong><span style="font-size: 15px;"><span data-custom-class="heading_1"><h2>4. WHEN AND WITH WHOM DO WE SHARE YOUR INFORMATION?</h2></span></span></strong></div>
          <div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">We may share information with AI Platforms, Cloud Computing Services, Payment Processors (Lemon Squeezy), and Website Hosting Service Providers.</span></span></div>
          <div style="line-height: 1.5;"><br></div>
          <div style="line-height: 1.5;"><strong><span style="font-size: 15px;"><span data-custom-class="heading_1"><h2>5. DO WE USE COOKIES?</h2></span></span></strong></div>
          <div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">Yes, we use cookies and similar tracking technologies to collect and store information.</span></span></div>
          <div style="line-height: 1.5;"><br></div>
          <div style="line-height: 1.5;"><strong><span style="font-size: 15px;"><span data-custom-class="heading_1"><h2>6. YOUR PRIVACY RIGHTS</h2></span></span></strong></div>
          <div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">Depending on your location, you may have rights including access, correction, deletion, and data portability of your personal information.</span></span></div>
          <div style="line-height: 1.5;"><br></div>
          <div style="line-height: 1.5;"><strong><span style="font-size: 15px;"><span data-custom-class="heading_1"><h2>7. HOW TO CONTACT US</h2></span></span></strong></div>
          <div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">For questions about this Privacy Policy, contact us at <a href="mailto:hassaankhaliq45@gmail.com">hassaankhaliq45@gmail.com</a></span></span></div>
          <div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">Veloxa AI, PS City Phase 2, Scheme 33, House no.R535, Street no.19, Karachi, Sindh 74500, Pakistan</span></span></div>
          </div>` 
          }} 
        />
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        © 2026 Veloxa AI. All rights reserved.
      </footer>
    </div>
  );
}