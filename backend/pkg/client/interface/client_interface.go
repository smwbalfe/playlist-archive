package interfaces

import (
	"net/http"

	"github.com/smwbalfe/playlist-archive/backend/pkg/client/shared"
)

type APIClient interface {
	Get(request string, headers map[string]string) (shared.RequestResponse, error)
	Post(url string, data interface{}, headers map[string]string) (shared.RequestResponse, error)
	BuildQueryURL(operationName string, variables string, extensions string) string
	GetTokens() (string, string)
	GetClient() *http.Client
}
