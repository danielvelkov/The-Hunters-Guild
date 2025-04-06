create or replace function load_csv_file -- functions are transactional to begin with
(
    target_table text,
    csv_path text,
    col_count integer
)

returns void as $$

declare

iter integer; -- dummy integer to iterate columns with
col text; -- variable to keep the column name at each iteration
col_first text; -- first column name, e.g., top left corner on a csv file or spreadsheet

begin
    create table temp_table (); 

    -- add just enough number of columns
    for iter in 1..col_count
    loop
        execute format('alter table temp_table add column col_%s text;', iter);
    end loop;

    -- copy the data from csv file
    execute format('copy temp_table from %L with delimiter '','' quote ''"'' csv ', csv_path);

    iter := 1;
    col_first := (select col_1 from temp_table limit 1);

    -- update the column names based on the first row which has the column names
    for col in execute format('select unnest(string_to_array(trim(temp_table::text, ''()''), '','')) from temp_table where col_1 = %L', col_first)
    loop
        execute format(
            'alter table temp_table rename column col_%s to %I',
            iter,  lower(replace(replace(col, '"', ''), ' ', '_'))
        );
        iter := iter + 1;
    end loop;

    -- delete the columns row
     execute format('delete from temp_table where %I = %L', lower(replace(replace(col_first, '"', ''), ' ', '_')), col_first);

    -- change the temp table name to the name given as parameter, if not blank
    if length(target_table) > 0 then
        execute format('alter table temp_table rename to %I', lower(Trim(replace(target_table, ' ', '_'))));
    end if;

end;

$$ language plpgsql;