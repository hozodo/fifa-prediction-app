import win32com.client as win
import pandas as pd

NO_RECORDS = "<i>No Records</i>"
pd.set_option('colheader_justify', 'center')
pd.set_option('display.float_format', '{:.2f}'.format)

# https://www.analyticsvidhya.com/blog/2021/06/style-your-pandas-dataframe-and-make-it-stunning/
# https://pandas.pydata.org/docs/reference/api/pandas.io.formats.style.Styler.set_properties.html

styles = [
    # dict(selector="tr:hover",
    #      props=[("background", "#4d4d4d")]),
    dict(selector="th", props=[("color", "#fff"),
                               ("border", "1px solid #4d4d4d"),
                               ("font-family", 'Helvetica'),
                               ("padding", "4px 8px"),
                               ("border-collapse", "collapse"),
                               ("background", "#4d4d4d"),
                               ("text-transform", "uppercase"),
                               ("font-size", "14px")
                               ]),
    dict(selector="td", props=[("color", "#4d4d4d"),
                               ("border", "1px solid #4d4d4d"),
                               ("font-family", 'Helvetica'),
                               ("padding", "4px 8px"),
                               ("border-collapse", "collapse"),
                               ("font-size", "14px"), ('justify', 'center')
                               ]),
    dict(selector="table", props=[
        ("font-family", 'Helvetica'),
        ("margin", "25px auto"),
        ("border-collapse", "collapse"),
        ("border", "1px solid #eee"),
        ("border-bottom", "2px solid #a6a6a6"),
     ]),
    dict(selector="caption", props=[("caption-side", "bottom")])
]


to = 'Sudhakar Fernando sudhakar.c@emirates.com;'
def send_email(body, subject, to=to, cc=None, attachments=[]):
    outlook = win.Dispatch('outlook.application')
    mail = outlook.CreateItem(0x0)
    # mail.SentOnBehalfOfName = 'EMAIL'
    mail.To = to
    mail.CC = cc
    mail.Subject = subject
    mail.HTMLBody = body
    if attachments:
        for i,j in enumerate(attachments):
            mail.Attachments.Add(attachments[i])
    mail.Send()


def html_table(df):
    df = df.reset_index(drop=True)
    if df.shape[0] > 0:
        df = df.style.set_table_styles(
            styles).hide(axis="index")
        df = df.to_html(index=False)
    else:
        df = NO_RECORDS
    return df

