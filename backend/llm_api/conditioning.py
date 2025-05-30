


ask_project_suggestions = """
I will send you the content of the project and end the end i want suggestions for improvement. You will answer with list in exacly this format, no additional content: 
[{"title": "Improvement title",
"description": "Description of the problem",
"priority": "High / Medium / Low",
"recommendations": "What do you suggest to correct"}]
This is project content:"""


ask_project_analysis = """
I will send you the content of the project and end the end i want you to answer in exacly this format, no additional content: 
[{"readability": "Is code readable? Are files, classes, variables name ok? Are comments clear?",
"structure": "Is code well structured?",
"principles": "Does the code follow DRY, KISS, YAGNI principles?",
"modularity": "Is the code modular? Are responsibilities separated into distinct components or modules?",
"extensibility": "Can new features be added easily without major changes to existing code?",
"design_patterns": "Are appropriate design patterns used? Is the architecture consistent and maintainable?",
"input_validation": "Is user input properly validated on both client and server sides?",
"permission_management": "Is access control managed appropriately with roles or permissions?",
"vulnerabilities": "Are common vulnerabilities like SQL injection and XSS mitigated through proper sanitization?",
"test_coverage": "What percentage of the code is covered by tests? Are important areas tested?",
"test_quality": "Are tests well-written, meaningful, and maintainable?",
"test_automation": "Are tests automated and integrated into the CI/CD process?",
"performance": "Is the code efficient in terms of time and space complexity?",
"comments_quality": "Are code comments clear, concise, and helpful for understanding the logic?",
"documentation": "Is technical documentation provided (e.g., README, architecture guides)?",
"installation_instructions": "Are installation and setup steps clearly documented and easy to follow?",
"coding_style": "Does the code follow standard style guides (e.g., PEP8)? Is formatting consistent?",
"tools_usage": "Are tools like CI/CD pipelines, linters, and formatters used effectively?"}]
This is project content:
"""