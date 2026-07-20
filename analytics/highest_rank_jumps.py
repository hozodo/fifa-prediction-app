import pandas as pd
from agent_highest_rank_jumps import agent

df_lastweek = pd.read_csv(r"C:\Users\S610690\Downloads\leaderboard_1307_overall.csv")
df_thisweek = pd.read_csv(r"C:\Users\S610690\Downloads\leaderboard_2007_overall.csv")
# Dropping current Rank Column
df_lastweek = df_lastweek.drop(columns=["Rank"])
df_thisweek = df_thisweek.drop(columns=["Rank"])
# Creating new Rankings
df_lastweek = df_lastweek.sort_values(by=["Total Points", "Average Score"],ascending=[False, False]).reset_index(drop=True)
df_lastweek["Rank"] = df_lastweek.index + 1
print(df_lastweek)
df_thisweek = df_thisweek.sort_values(by=["Total Points", "Average Score"],ascending=[False, False]).reset_index(drop=True)
df_thisweek["Rank"] = df_thisweek.index + 1
print(df_thisweek)

last_week_ranks = df_lastweek[["Name", "Rank"]].rename(
    columns={"Rank": "LastWeekRank"}
)
df_thisweek = df_thisweek.merge(last_week_ranks,on="Name",how="left"
)
df_thisweek["Rank Difference"] = (df_thisweek["LastWeekRank"] - df_thisweek["Rank"])
df_thisweek.loc[df_thisweek["LastWeekRank"].isna(),"Rank Difference"] = 0
df_thisweek["Rank Difference"] = df_thisweek["Rank Difference"].astype(int)
df_thisweek["LastWeekRank"] = (df_thisweek["LastWeekRank"].fillna(0).astype(int))
top_10 = (df_thisweek.sort_values(by=["Rank Difference", "Total Points"],ascending=[False, False]).head(10)).reset_index(drop = True)
top_10 = top_10.drop(columns=["Average Score","Total Points","NumberofMatches"])
top_10 = top_10.rename(columns={"Rank": "Current Rank", "Rank Difference" : "Spots Moved", "LastWeekRank" : "Last Week's Rank"})
top_10 = top_10.drop(columns=["Current Rank","Last Week's Rank"])
top_10["Rank"] = top_10.index + 1
rank_col = top_10.pop("Rank")
top_10.insert(0, "Rank", rank_col)

rank_emojis = {
        1: "🥇",
        2: "🥈",
        3: "🥉",
        4: "4ᵗʰ",
        5: "5ᵗʰ",
        6: "6ᵗʰ",
        7: "7ᵗʰ",
        8: "8ᵗʰ",
        9: "9ᵗʰ",
        10: "10ᵗʰ",
    }

top_10["Rank"] = top_10["Rank"].replace(rank_emojis)
print(top_10)
# If you need the rows for your agent/message
rows = [tuple(f"{x:.2f}" if isinstance(x, float) else x for x in row)
for row in top_10.itertuples(index=False, name=None)]
agent(rows)