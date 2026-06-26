# AI Test Case Generator

Generate structured Azure DevOps Test Cases directly from User Stories using AI.

## Features

- Reads title, description, and acceptance criteria from the open User Story
- Generates multiple test cases with steps (action + expected result)
- Preview and edit drafts before creating work items
- Creates Test Case work items and links them to the source User Story

## Setup

1. Deploy the backend service (see project README).
2. Install this extension to your Azure DevOps organization.
3. In **Organization Settings → Extensions → AI Test Case Generator**, set the **API Base URL** to your backend.

## Requirements

- Azure DevOps organization with Test Plans / Test Case work item type enabled
- Backend service with Azure OpenAI or OpenAI API access
