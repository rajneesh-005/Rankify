import pandas as pd
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def test_api(request):
    return Response({
        "message":"API Working",
        "status" :"success"
    })

@api_view(['POST'])
def upload_excel(request):
    file = request.FILES.get("file")

    if not file:
        return Response({"error": "No file uploaded"}, status=400)

    try:
        df = pd.read_excel(file)
    except Exception:
        return Response({"error": "Invalid Excel file"}, status=400)

    # Normalize column names
    df.columns = df.columns.str.strip().str.lower()

    required_columns = ["roll", "name", "attendance"]
    for col in required_columns:
        if col not in df.columns:
            return Response(
                {"error": f"Missing required column: {col}"},
                status=400
            )

    # Subject columns
    subject_cols = df.columns[3:]
    if len(subject_cols) == 0:
        return Response({"error": "No subject columns found"}, status=400)

    # Convert subject marks to numeric
    df[subject_cols] = df[subject_cols].apply(pd.to_numeric, errors="coerce")

    # PASS / FAIL logic
    df["passed"] = df[subject_cols].ge(40).all(axis=1) & (df["attendance"] >= 75)

    # TOTAL marks
    df["total"] = df[subject_cols].sum(axis=1)

    # RANK only passed students
    df["rank"] = None
    passed_df = df[df["passed"]].copy()
    passed_df["rank"] = passed_df["total"].rank(
        ascending=False,
        method="dense"
    )
    df.loc[passed_df.index, "rank"] = passed_df["rank"]

    # Sort: passed first, then by total
    df = df.sort_values(by=["passed", "total"], ascending=[False, False])

    return Response({
        "results": df.to_dict(orient="records")
    })
