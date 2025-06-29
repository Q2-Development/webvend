#!make
include ./backend/supabase.env

up:
	docker-compose up -d

down:
	docker-compose down

rebuild:
	docker-compose down --volumes --remove-orphans
	docker-compose up --build

supabase-init:
	cd backend && npm i supabase --save-dev && npx supabase start

supabase-start:
	cd backend && npx supabase start

supabase-stop:
	cd backend && npx supabase stop

supabase-functions-deploy:
	cd backend && npx supabase functions deploy webvend --project-ref ${SUPABASE_PROJECT_REF}