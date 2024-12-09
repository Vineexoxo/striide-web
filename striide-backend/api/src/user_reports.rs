use application::upload_reports::{delete_draft, get_all_published_reports, get_report_dislikes, get_report_draft, get_report_ids, get_report_info, get_report_likes, get_user_liked_report, insert_report, set_draft_to_publish, user_like_report, Id, ReportLike};
use infrastructure::database::Db;
use rocket::{http::Status, serde::json::Json};
// use rocket_db_pools::Connection;
// use infrastructure::database::Db;
use models::user::UserSession;
use shared::response_models::{
    BasicReportInfo, ClientResponse, ErrorResponse, ReportBody, ReportRequest, Reports, Response, ResponseBody, UserReport, UserReportLikes
};
use rocket_db_pools::Connection;

#[post("/upload_report", data = "<request>")]
pub async fn upload_report(
    request: Json<UserReport>,
    user_session: UserSession,
) -> Result<Response, ErrorResponse> {
    let _ = insert_report(user_session, request.into_inner()).await?;

    Ok(Response {
        status: Status::Ok,
        body: ResponseBody::ClientResponse(ClientResponse {
            is_ok: true,
            status: 200,
        }),
    })
}

#[get("/fetch_reports")]
pub async fn fetch_reports(
    mut db: Connection<Db>,
    user_session: UserSession,
) -> Result<Response, ErrorResponse> {
    let reports = get_all_published_reports(user_session, &mut **db).await?;

    Ok(Response {
        status: Status::Ok,
        body: ResponseBody::Reports(Reports { reports: reports }),
    })
}

#[post("/fetch_report_draft", data = "<request>")]
pub async fn fetch_report_draft(
    request: Json<ReportRequest>,
    mut db: Connection<Db>,
) -> Result<Response, ErrorResponse> {
    let report_body = get_report_draft(request.into_inner(), &mut **db).await?;

    Ok(Response {
        status: Status::Ok,
        body: ResponseBody::ReportBody(ReportBody {
            reportID: report_body.reportID, 
            address: report_body.address,
            userid: report_body.userid,
            lng: report_body.lng,
            lat: report_body.lat,
            duration: report_body.duration,
            description: report_body.description,
            media: report_body.media,
            is_published: report_body.is_published,
            created_at: report_body.created_at 
        }),
    })
}

#[post("/discard_draft", data="<request>")]
pub async fn discard_draft(request: Json<ReportRequest>, mut db: Connection<Db>) -> Result<Response, ErrorResponse>{

    let rows_affected = delete_draft(request.into_inner(), &mut **db).await?;  

    Ok(Response {
        status: Status::Ok, 
        body: ResponseBody::ClientResponse(ClientResponse {
            is_ok: true, 
            status: rows_affected as u32
        })
    })
}

#[post("/publish_draft", data="<request>")]
pub async fn publish_draft(request: Json<ReportRequest>, mut db: Connection<Db>) -> Result<Response, ErrorResponse>{

    let rows_affected = set_draft_to_publish(request.into_inner(), &mut **db).await?;  

    Ok(Response {
        status: Status::Ok, 
        body: ResponseBody::ClientResponse(ClientResponse {
            is_ok: true, 
            status: rows_affected as u32
        })
    })
}

#[get("/report_ids")]
pub async fn report_ids(mut db: Connection<Db>) -> Result<Response, ErrorResponse> {
    let report_ids = get_report_ids(&mut *db).await?;

    Ok(Response {
        status: Status::Ok,
        body: ResponseBody::BasicReportInfo(BasicReportInfo {
            reports: report_ids,
        }),
    })
}
#[post("/get_report", data="<request>")]
pub async fn get_report(request: Json<Id>) -> Result<Response, ErrorResponse> {
    let report = get_report_info(request.into_inner().id).await?;

    Ok(Response {
        status: Status::Ok,
        body: ResponseBody::ReportString(report),
    })
}

#[post("/report_likes", data="<request>")]
pub async fn report_likes(request: Json<Id>, session: UserSession, mut db: Connection<Db>) -> Result<Response, ErrorResponse> {
    let id = request.into_inner().id;
    let report_likes = get_report_likes(id.clone(), &mut *db).await.map_err(|_| {
        ErrorResponse {
            status: Status::InternalServerError,
            message: "Failed to get report likes".to_owned(),
        }
    })?;

    let report_dislikes = get_report_dislikes(id.clone(), &mut *db).await.map_err(|_| {
        ErrorResponse {
            status: Status::InternalServerError,
            message: "Failed to get report dislikes".to_owned(),
        }
    })?;

    let user_liked = get_user_liked_report(id, session.id, &mut *db).await.map_err(|_| {
        ErrorResponse {
            status: Status::InternalServerError,
            message: "Failed to get user liked report".to_owned(),
        }
    })?;

    Ok(Response {
        status: Status::Ok,
        body: ResponseBody::ReportLikes(UserReportLikes {
            likes: report_likes,
            dislikes: report_dislikes,
            user_liked,
        }),
    })
}

#[post("/like_report", data="<request>")]
pub async fn like_report(request: Json<ReportLike>, session: UserSession, mut db: Connection<Db>) -> Result<Response, ErrorResponse> {
    let req = request.into_inner();
    user_like_report(req.id, session.id, req.liked, &mut *db).await?;
    Ok(Response {
        status: Status::Ok,
        body: ResponseBody::ClientResponse(ClientResponse {
            is_ok: true,
            status: 200,
        }),
    })
}

